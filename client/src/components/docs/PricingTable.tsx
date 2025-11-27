// client/src/components/docs/PricingTable.tsx
import React from 'react';
import { modelPricing } from '@/shared/buddhistAgents';
import { useOutletContext } from 'react-router-dom';

const translations = {
  vi: {
    title: "Giá Token",
    description: "Giá dựa trên công đức của chúng tôi được tính toán dựa trên việc sử dụng token (mỗi triệu token), đảm bảo giá trị công bằng cho cả đầu vào (câu hỏi) và đầu ra (câu trả lời).",
    headers: {
      model: "Mô hình",
      input: "Giá Input / 1M Tokens",
      output: "Giá Output / 1M Tokens",
      context: "Cửa sổ ngữ cảnh",
      maxOutput: "Output tối đa"
    }
  },
  en: {
    title: "Token Pricing",
    description: "Our merit-based pricing is calculated based on token usage per million tokens, ensuring fair value for both input (prompts) and output (responses).",
    headers: {
      model: "Model",
      input: "Input Cost / 1M Tokens",
      output: "Output Cost / 1M Tokens",
      context: "Context Window",
      maxOutput: "Max Output"
    }
  }
};

export const PricingTable: React.FC = () => {
  const { language } = useOutletContext<{ language: 'vi' | 'en' }>() || { language: 'en' }; // Fallback if used outside context
  const t = translations[language];
  const pricingList = Object.values(modelPricing);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className=" text-3xl font-semibold text-foreground" data-testid="heading-token-pricing">
          {t.title}
        </h2>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
          {t.description}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full  text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-3 px-4 text-left font-semibold text-foreground">{t.headers.model}</th>
              <th className="py-3 px-4 text-left font-semibold text-foreground">{t.headers.input}</th>
              <th className="py-3 px-4 text-left font-semibold text-foreground">{t.headers.output}</th>
              <th className="py-3 px-4 text-left font-semibold text-foreground">{t.headers.context}</th>
              <th className="py-3 px-4 text-left font-semibold text-foreground">{t.headers.maxOutput}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pricingList.map((item) => (
              <tr key={item.name} className="hover-elevate">
                <td className="py-3 px-4 font-semibold text-foreground">
                  <div>{item.name}</div>
                  <div className="text-xs text-muted-foreground font-normal mt-1">{item.description}</div>
                </td>
                <td className="py-3 px-4 text-muted-foreground">${item.inputPrice.toFixed(2)}</td>
                <td className="py-3 px-4 text-muted-foreground">${item.outputPrice.toFixed(2)}</td>
                <td className="py-3 px-4 text-muted-foreground">{item.contextWindow.toLocaleString()}</td>
                <td className="py-3 px-4 text-muted-foreground">{item.maxOutput.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};