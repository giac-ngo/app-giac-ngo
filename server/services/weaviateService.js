// server/services/weaviateService.js
import weaviate from 'weaviate-ts-client';
import 'dotenv/config';
import crypto from 'crypto';
import { pool, mapRowToCamelCase } from '../db.js';
import { aiConfigModel } from '../models/aiConfig.model.js';
import { userModel } from '../models/user.model.js';
import { trainingDataModel } from '../models/trainingData.model.js';
import { fileParserService } from './fileParserService.js';

const WEAVIATE_CLASSES = {
    gpt: 'TrainingData_gpt',
    gemini: 'TrainingData_gemini',
};

const getClassNameForModel = (modelType) => {
    const className = WEAVIATE_CLASSES[modelType];
    if (!className) throw new Error(`Unsupported modelType for Weaviate: ${modelType}`);
    return className;
};

// Generate a consistent UUID for a data source item
const generateUuid = (sourceId, type) => {
    const hash = crypto.createHash('sha1');
    hash.update(`source-${type}-${sourceId}`);
    const hex = hash.digest('hex');
    // Format as UUID
    return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20, 32)}`;
};

const weaviateService = {
    // Creates a temporary client with owner-specific API keys in the header using the v2 API
    async _getScopedClient(modelType, apiKey) {
        let weaviateUrl = process.env.WEAVIATE_URL;
        if (!weaviateUrl) {
            throw new Error('WEAVIATE_URL is not set in the environment variables. Please check your .env file.');
        }

        let weaviateKey = process.env.WEAVIATE_KEY;
        if (!weaviateKey) {
            throw new Error('WEAVIATE_KEY is not set for Weaviate Cloud connection. Please check your .env file.');
        }

        // Strip quotes if they exist from .env file
        weaviateUrl = weaviateUrl.replace(/["']/g, "");
        weaviateKey = weaviateKey.replace(/["']/g, "");

        const headers = {};
        if (modelType === 'gpt' && apiKey) {
            headers['X-OpenAI-Api-Key'] = apiKey;
        } else if (modelType === 'gemini' && apiKey) {
            headers['X-Google-Api-Key'] = apiKey;
        }
        
        try {
            const url = new URL(weaviateUrl);
            const client = weaviate.client({
                scheme: url.protocol.slice(0, -1),
                host: url.host,
                apiKey: new weaviate.ApiKey(weaviateKey),
                headers,
            });

            // A simple ready check
            const isReady = await client.misc.readyChecker().do();
            if (!isReady) {
                throw new Error("Weaviate instance is not ready.");
            }
            return client;
        } catch (err) {
            console.error("Failed to connect to Weaviate:", err);
            throw new Error(`Could not connect to Weaviate. Check your config. Original error: ${err.message}`);
        }
    },

    async ensureSchemaForModelType(modelType, apiKey) {
        const client = await this._getScopedClient(modelType, apiKey);
        const className = getClassNameForModel(modelType);
        
        try {
            const schema = await client.schema.getter().do();
            if (schema.classes && schema.classes.some(c => c.class === className)) {
                return; // Schema already exists
            }

            console.log(`Weaviate schema for ${className} not found. Creating...`);

            let classObj;
            const commonProperties = [
                { name: 'content', dataType: ['text'] },
                { name: 'aiConfigId', dataType: ['int'] },
                { name: 'sourceType', dataType: ['text'] },
                { name: 'sourceId', dataType: ['int'] },
            ];

            if (modelType === 'gpt') {
                classObj = {
                    'class': className,
                    'vectorizer': "text2vec-openai",
                    'properties': commonProperties,
                };
            } else if (modelType === 'gemini') {
                if (!process.env.GOOGLE_PROJECT_ID) {
                    throw new Error('GOOGLE_PROJECT_ID environment variable is not set. It is required for the text2vec-google module in Weaviate.');
                }
                classObj = {
                    'class': className,
                    'vectorizer': "text2vec-google",
                     'moduleConfig': {
                        'text2vec-google': {
                            'projectId': process.env.GOOGLE_PROJECT_ID,
                            'vectorizeClassName': false
                        },
                    },
                    'properties': commonProperties,
                };
            } else {
                return; // Should not happen
            }

            await client.schema.classCreator().withClass(classObj).do();
            console.log(`Schema for ${className} created successfully.`);

        } catch (error) {
            console.error(`Error during Weaviate schema setup for ${modelType}:`, error.message);
            // Re-throw the error so the sync process knows it failed.
            throw error;
        }
    },

    async syncAllDataForAI(aiConfigId) {
        console.log(`Starting data sync for AI config ID: ${aiConfigId}`);
        const aiConfig = await aiConfigModel.findById(aiConfigId);
        if (!aiConfig) {
            throw new Error(`AI config with ID ${aiConfigId} not found.`);
        }
        if (!aiConfig.spaceId) {
            throw new Error(`AI config with ID ${aiConfigId} does not belong to a space.`);
        }

        const spaceRes = await pool.query('SELECT user_id FROM spaces WHERE id = $1', [aiConfig.spaceId]);
        if (spaceRes.rows.length === 0) {
            throw new Error(`Space with ID ${aiConfig.spaceId} not found for AI ${aiConfigId}.`);
        }
        
        const owner = await userModel.findById(spaceRes.rows[0].user_id);
        if (!owner) {
            throw new Error(`Owner (User ID: ${spaceRes.rows[0].user_id}) for Space ${aiConfig.spaceId} not found.`);
        }

        const ownerKeys = owner.apiKeys || {};
        const ownerGptKey = ownerKeys.gpt;
        const ownerGeminiKey = ownerKeys.gemini;
        const dataSources = await trainingDataModel.findByAiId(aiConfigId);
        
        console.log(`Found ${dataSources.length} data sources to sync for AI ${aiConfigId}.`);

        // --- GPT Sync Process ---
        if (!ownerGptKey) {
            console.log(`Skipping Weaviate sync for GPT (AI ID: ${aiConfigId}): Owner's GPT key is missing.`);
        } else {
            try {
                console.log(`Ensuring schema exists for GPT (AI ID: ${aiConfigId})...`);
                await this.ensureSchemaForModelType('gpt', ownerGptKey);
                console.log(`Starting Weaviate sync for GPT (AI ID: ${aiConfigId})...`);
                await this.indexData('gpt', dataSources, ownerGptKey, aiConfigId);
            } catch (error) {
                 console.error(`Error during Weaviate sync for GPT (AI ID: ${aiConfigId}):`, error.message);
                // Re-throw to make it clear the process failed
                throw new Error(`Error during Weaviate sync for GPT (AI ID: ${aiConfigId}): ${error.message}`);
            }
        }

        // --- Gemini Sync Process ---
        if (!ownerGeminiKey) {
            console.log(`Skipping Weaviate sync for Gemini (AI ID: ${aiConfigId}): Owner's Gemini key is missing.`);
        } else if (!process.env.GOOGLE_PROJECT_ID) {
            console.log(`Skipping Weaviate sync for Gemini (AI ID: ${aiConfigId}): GOOGLE_PROJECT_ID is not set.`);
        } else {
            try {
                console.log(`Ensuring schema exists for Gemini (AI ID: ${aiConfigId})...`);
                await this.ensureSchemaForModelType('gemini', ownerGeminiKey);
                console.log(`Starting Weaviate sync for Gemini (AI ID: ${aiConfigId})...`);
                await this.indexData('gemini', dataSources, ownerGeminiKey, aiConfigId);
            } catch (error) {
                 console.error(`Error during Weaviate sync for Gemini (AI ID: ${aiConfigId}):`, error.message);
                 throw new Error(`Error during Weaviate sync for Gemini (AI ID: ${aiConfigId}): ${error.message}`);
            }
        }
    },

    async indexData(modelType, dataSources, apiKey, aiConfigId) {
        try {
            const client = await this._getScopedClient(modelType, apiKey);
            const className = getClassNameForModel(modelType);
            
            let batcher = client.batch.objectsBatcher();
            let counter = 0;
            const batchSize = 100;
    
            for (const source of dataSources) {
                if (source.isIndexed) continue;
    
                let content = null;
                if (source.type === 'qa' && source.question && source.answer) {
                    content = `Question: ${source.question}\nAnswer: ${source.answer}`;
                } else if (source.type === 'file' && source.fileUrl && source.fileName) {
                    // **UPDATED LOGIC**: Prioritize summary. If not available, use full file content.
                    if (source.summary) {
                        content = source.summary;
                    } else {
                        try {
                            content = await fileParserService.extractText(source.fileUrl, source.fileName);
                        } catch (fileError) {
                            console.error(`Failed to parse file ${source.fileName} (ID: ${source.id}):`, fileError);
                            continue;
                        }
                    }
                }
    
                if (content) {
                    const properties = {
                        content,
                        aiConfigId,
                        sourceType: source.type,
                        sourceId: source.id,
                    };
                    const uuid = generateUuid(source.id, source.type);
                    
                    batcher = batcher.withObject({
                        class: className,
                        properties,
                        id: uuid,
                    });
                    counter++;
                }
    
                if (counter >= batchSize) {
                    const results = await batcher.do();
                    results.forEach(item => {
                        if (item.result?.errors) {
                             console.error(`Weaviate batch import failed for object.`, JSON.stringify(item.result.errors, null, 2));
                        }
                    });
                    console.log(`Indexed a batch of ${results.length} objects to ${className}.`);
                    
                    batcher = client.batch.objectsBatcher(); // Reset for next batch
                    counter = 0;
                }
                
                await trainingDataModel.updateIndexedStatus(source.id, true);
            }
    
            if (counter > 0) {
                const results = await batcher.do();
                results.forEach(item => {
                    if (item.result?.errors) {
                         console.error(`Weaviate final batch import failed for object.`, JSON.stringify(item.result.errors, null, 2));
                    }
                });
                console.log(`Indexed final ${counter} objects to ${className}.`);
            } else {
                console.log(`No new data to index for ${className}.`);
            }
        } catch (error) {
            console.error(`[FATAL] in indexData for ${modelType}: ${error.message}`);
            throw error;
        }
    },

    async search(modelType, aiConfigId, query, apiKey, limit = 5) {
        const client = await this._getScopedClient(modelType, apiKey);
        const className = getClassNameForModel(modelType);
        
        const res = await client.graphql
            .get()
            .withClassName(className)
            .withFields('content sourceType sourceId')
            .withNearText({ concepts: [query] })
            .withWhere({
                operator: 'Equal',
                path: ['aiConfigId'],
                valueInt: aiConfigId,
            })
            .withLimit(limit)
            .do();
        
        return res.data.Get[className];
    },

    async deleteDataByAiConfigId(modelType, aiConfigId, apiKey) {
        try {
            const client = await this._getScopedClient(modelType, apiKey);
            const className = getClassNameForModel(modelType);
            
            const result = await client.batch.deleter()
                .withClassName(className)
                .withWhere({ operator: 'Equal', path: ['aiConfigId'], valueInt: aiConfigId })
                .do();

            if (result.results && result.results.matches > 0) {
                console.log(`Deleted ${result.results.matches} objects for aiConfigId ${aiConfigId} from ${className}.`);
            }
        } catch (error) {
            console.error(`Failed to delete data for aiConfigId ${aiConfigId}:`, error.message);
        }
    },
    
    async deleteDataBySourceId(modelType, sourceId, sourceType, apiKey) {
         try {
            const client = await this._getScopedClient(modelType, apiKey);
            const className = getClassNameForModel(modelType);
            const uuid = generateUuid(sourceId, sourceType);

            const exists = await client.data.checker().withClassName(className).withId(uuid).do();
            if(exists) {
                await client.data.deleter().withClassName(className).withId(uuid).do();
                console.log(`Deleted source data with ID ${sourceId} (UUID: ${uuid}) from ${className}.`);
            }
         } catch(error) {
             console.error(`Failed to delete data for sourceId ${sourceId}:`, error.message);
         }
    }
};

export default weaviateService;