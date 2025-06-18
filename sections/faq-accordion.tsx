
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    id: "item-1",
    question: "Como devo preencher o campo \"Trajeto\"?",
    answer:
      "No campo Trajeto, insira o caminho percorrido, informando a cidade ou local de origem e destino da viagem (exemplo: São Paulo - Campinas). Certifique-se de que está claro o ponto inicial e final para facilitar o controle e análise das rotas.",
  },
  {
    id: "item-2",
    question: "Qual a forma correta de informar os custos (HP R$, Serv R$, etc)?",
    answer: (
      <>
        Os campos de custo devem ser preenchidos com os valores gastos em cada categoria:
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li><strong>HP R$:</strong> combustível ou uso por hora do veículo.</li>
          <li><strong>Serv R$:</strong> serviços extras como lavagem ou manutenção.</li>
          <li><strong>Ped R$:</strong> pedágios.</li>
          <li><strong>Est R$:</strong> estacionamento.</li>
        </ul>
        <p className="mt-2">Os valores devem estar em reais (R$), com até duas casas decimais (ex: 12.50).</p>
      </>
    ),
  },
  {
    id: "item-3",
    question: "A assinatura é obrigatória?",
    answer:
      "Sim, ao final do formulário é necessário realizar a assinatura digital no campo indicado para validar o preenchimento. A assinatura é importante para garantir a autenticidade e a responsabilidade sobre as informações fornecidas.",
  },
];

export function FaqAccordion() {
  return (
    <section id="duvidas" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto max-w-3xl px-4 md:px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center text-foreground">
          Dúvidas Frequentes
        </h2>
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqItems.map((item) => (
            <AccordionItem value={item.id} key={item.id} className="border border-border rounded-lg shadow-sm bg-card">
              <AccordionTrigger className="p-6 text-xl text-left hover:no-underline text-foreground">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="p-6 pt-0 text-muted-foreground text-base leading-relaxed">
                {typeof item.answer === 'string' ? item.answer : <>{item.answer}</>}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
