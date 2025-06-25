"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, Trash2, Send } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import ReactSignatureCanvas from "react-signature-canvas";
import { useRef, useState, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const formSchema = z.object({
  empresa: z.string().min(1, "Empresa é obrigatória."),
  usuario: z.string().min(1, { message: "Nome do Motorista é obrigatório." }).max(50, { message: "Nome do Motorista não pode exceder 50 caracteres." }),
  trajeto: z.string().min(1, "Trajeto é obrigatório."),
  saida: z.string().min(1, "Horário de saída é obrigatório."),
  chegada: z.string().min(1, "Horário de chegada é obrigatório."),
  
  km: z.string().min(1, "KM deve ser um número."),
  hpReais: z.string().min(1, "Hora Parada deve ser um número."),
  pedReais: z.string().min(1, "Ped R$ deve ser um número."),
  estReais: z.string().min(1, "Est R$ deve ser um número."),
  assinatura: z.string().min(1,"Assinatura é obrigatória."), 
  dataAssinatura: z.date({ required_error: "Data da assinatura é obrigatória." }),
});

type FormData = z.infer<typeof formSchema>;

export function ContactForm() {
  const { toast } = useToast();
  const sigCanvasRef = useRef<ReactSignatureCanvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState(300);

  useEffect(() => {
    setIsClient(true);
    function updateWidth() {
      if (containerRef.current) {
        setCanvasWidth(containerRef.current.offsetWidth);
      }
    }
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      empresa: "",
      usuario: "",
      trajeto: "",
      saida: "",
      chegada: "",
      km: "",
      hpReais: "",
      pedReais: "",
      estReais: "",
      assinatura: "",
      dataAssinatura: new Date(),
    },
  });

  const watchedKm = form.watch("km");
  const watchedHpReais = form.watch("hpReais");
  const watchedPedReais = form.watch("pedReais");
  const watchedEstReais = form.watch("estReais");

  const clearSignature = () => {
    sigCanvasRef.current?.clear();
    form.setValue("assinatura", "", { shouldValidate: true }); 
  };

  const handleSignatureEnd = () => { 
    if (sigCanvasRef.current) {
      const dataUrl = sigCanvasRef.current.getTrimmedCanvas().toDataURL("image/png");
      form.setValue("assinatura", dataUrl || "", { shouldValidate: true });
    }
  };
  
  async function onSubmit(data: FormData) {
    setIsSubmitting(true);
    const currentSignature = form.getValues("assinatura");
    if (!currentSignature || sigCanvasRef.current?.isEmpty()) {
        toast({
            title: "Erro de Validação",
            description: "A assinatura é obrigatória.",
            variant: "destructive",
        });
        form.setError("assinatura", { type: "manual", message: "Assinatura é obrigatória." });
        setIsSubmitting(false);
        return;
    }

    const serialRes = await fetch('/api/serial-number', { method: 'POST' });
    const serialData = await serialRes.json();
    const serialNumber = serialData.serial;

    const pdfContentElement = document.createElement('div');
    pdfContentElement.style.width = '210mm'; 
    pdfContentElement.style.padding = '20px';
    pdfContentElement.style.fontFamily = 'Arial, sans-serif';
    pdfContentElement.style.fontSize = '12px';
    pdfContentElement.style.boxSizing = 'border-box';
    pdfContentElement.style.position = 'relative';

    const formatCurrency = (value?: string) => {
        if (value === "" || value === null || value === undefined) return "0,00";
        const num = Number(value);
        if (isNaN(num)) return "0,00";
        return num.toFixed(2).replace('.',',');
    }
    
    pdfContentElement.innerHTML = `
      <div style="position: absolute; left: 20px; top: 20px; font-size: 14px; color: #888;">
        N*${serialNumber}
      </div>
      <h1 style="text-align: center; margin-bottom: 20px; font-size: 20px; color: #333;">Formulário de Transporte</h1>
      
      <div style="margin-bottom: 15px; padding: 10px; border: 1px solid #eee; border-radius: 5px; background-color: #f9f9f9;">
        <h2 style="font-size: 16px; margin-top: 0; margin-bottom:10px; border-bottom: 1px solid #ddd; padding-bottom: 5px; color: #555;">Dados Gerais</h2>
        <p><strong>Empresa:</strong> ${data.empresa}</p>
        <p><strong>Nome do Motorista:</strong> ${data.usuario}</p>
        <p><strong>Trajeto:</strong> ${data.trajeto}</p>
        <p><strong>Saída:</strong> ${data.saida}</p>
        <p><strong>Chegada:</strong> ${data.chegada}</p>
      </div>
      
      <div style="margin-bottom: 15px; padding: 10px; border: 1px solid #eee; border-radius: 5px; background-color: #f9f9f9;">
        <h2 style="font-size: 16px; margin-top: 0; margin-bottom:10px; border-bottom: 1px solid #ddd; padding-bottom: 5px; color: #555;">Custos (R$)</h2>
        <p><strong>KM:</strong> ${data.km}</p>
        <p><strong>Hora Parada:</strong> ${data.hpReais}</p>
        <p><strong>Ped R$:</strong> ${data.pedReais}</p>
        <p><strong>Est R$:</strong> ${data.estReais}</p>
      </div>
      
      <div style="margin-top: 20px; padding: 10px; border: 1px solid #eee; border-radius: 5px; background-color: #f9f9f9;">
        <h2 style="font-size: 16px; margin-top: 0; margin-bottom:10px; border-bottom: 1px solid #ddd; padding-bottom: 5px; color: #555;">Assinatura e Data</h2>
        <p><strong>Data:</strong> ${format(data.dataAssinatura, "dd/MM/yyyy", { locale: ptBR })}</p>
        <p style="margin-top:10px;"><strong>Assinatura:</strong></p>
        ${currentSignature ? `<img src="${currentSignature}" alt="Assinatura" style="width: 180px; height: auto; border: 1px solid #ccc; margin-top: 5px; background-color: #fff;" />` : '<p>Não fornecida</p>'}
      </div>
      <div style="margin-top: 160px; text-align: center;">
        <img src='/icons/Logo Empres RS Transporte Sem Fundo-2.png' alt='Logo RS Transporte' style='display: block; margin: 0 auto 8px auto; max-width: 60px; height: auto;' />
        <div style='font-size: 14px; font-weight: bold; margin-top: 4px;'>Cnpj: 30.735.162/0001-39</div>
      </div>
    `;
    document.body.appendChild(pdfContentElement);

    try {
      const canvas = await html2canvas(pdfContentElement, { scale: 1, useCORS: true, backgroundColor: '#ffffff' });
      document.body.removeChild(pdfContentElement);
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps= pdf.getImageProperties(canvas);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      let position = 0;
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, pdfWidth, pdfHeight);
      let heightLeft = pdfHeight - pdf.internal.pageSize.getHeight();

      while (heightLeft > 0) {
        position = heightLeft - pdf.internal.pageSize.getHeight(); 
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }
      
      const userNameNormalized = data.usuario.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '_').toLowerCase();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const pdfFileNameForDrive = `viagem_${userNameNormalized || 'usuario'}_${timestamp}.pdf`;
      
      const pdfBase64 = pdf.output('datauristring').split(',')[1];

      const scriptPayload = {
        pdfBase64: pdfBase64,
        fileName: pdfFileNameForDrive,
        folderName: "Travel Information" 
      };
      
      console.log("Attempting to send to Apps Script. URL:", '/api/proxy-google-drive');
      console.log("Payload keys being sent to Apps Script:", Object.keys(scriptPayload));

      const scriptResponse = await fetch('/api/proxy-google-drive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scriptPayload)
      });

      if (!scriptResponse.ok) {
        const errorText = await scriptResponse.text();
        throw new Error(`Falha ao enviar para o Google Drive: ${scriptResponse.status} - ${errorText}`);
      }

      const result = await scriptResponse.json();
      const googleDriveLink = result.url;

      if (!googleDriveLink || result.status !== 'success') {
        throw new Error(result.message || "Link do Google Drive não recebido ou falha no script.");
      }

      const whatsappMessage = `Olá, segue o formulário do Motorista ${data.usuario}. Link para o PDF: ${googleDriveLink}`;
      const whatsappNumber = "5511952691735";
      const encodedMessage = encodeURIComponent(whatsappMessage);

      const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
      const whatsappUrl = isMobile
        ? `https://wa.me/${whatsappNumber}?text=${encodedMessage}`
        : `https://web.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`;

      window.open(whatsappUrl, '_blank')?.focus();
      
      toast({
        title: "PDF Enviado e Link Gerado!",
        description: (
          <>
            PDF enviado para o Google Drive. Link: <a href={googleDriveLink} target="_blank" rel="noopener noreferrer" className="underline">{googleDriveLink}</a>
            <br />
            Abrindo WhatsApp...
          </>
        ),
        duration: 15000, 
      });

      form.reset();
      if (sigCanvasRef.current) {
        sigCanvasRef.current.clear();
      }
      form.reset({
        empresa: "",
        usuario: "",
        trajeto: "",
        saida: "",
        chegada: "",
        km: "",
        hpReais: "",
        pedReais: "",
        estReais: "",
        assinatura: "",
        dataAssinatura: new Date(),
      });

    } catch (error: any) {
      if (pdfContentElement.parentElement) {
        document.body.removeChild(pdfContentElement);
      }
      console.error("Falha na requisição para o Google Apps Script ou na geração do PDF:", error);
      let description = "Não foi possível conectar ao serviço do Google Drive. Verifique sua conexão com a internet. ";
      if (error.message && error.message.toLowerCase().includes('failed to fetch')) {
        description += "Isso pode ser um problema de CORS ou configuração do script no Google Drive. Verifique se o Google Apps Script está corretamente implantado com acesso para 'Qualquer pessoa' (ou 'Qualquer pessoa, inclusive anônimos') e se a URL está correta. Certifique-se também de que uma nova versão foi implantada após qualquer alteração no script e que a função doPost está corretamente configurada para lidar com a requisição POST.";
      } else if (error.message && error.message.includes('Falha ao enviar para o Google Drive')) {
        description = error.message; 
      } else if (error.message) {
         description += `Detalhe: ${error.message}`;
      } else {
        description += "Ocorreu um erro desconhecido durante a operação.";
      }
      toast({
        title: "Erro na Operação",
        description: description,
        variant: "destructive",
        duration: 15000,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isClient) {
    return (
      <section id="formulario" className="py-16 md:py-24 bg-secondary">
        <div className="container mx-auto max-w-2xl px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center text-foreground">
            Formulário
          </h2>
          <div className="space-y-8 bg-card p-6 sm:p-8 rounded-lg shadow-xl">
            Carregando formulário...
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="formulario" className="py-16 md:py-24 bg-secondary">
      <div className="container mx-auto max-w-2xl px-4 md:px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center text-foreground">
          Formulário
        </h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 bg-card p-6 sm:p-8 rounded-lg shadow-xl">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="empresa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Empresa</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da empresa" {...field} className="text-base p-3 h-12" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="usuario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Motorista</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do Motorista" {...field} className="text-base p-3 h-12" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="trajeto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Trajeto</FormLabel>
                  <FormControl>
                    <Input placeholder="Origem - Destino" {...field} className="text-base p-3 h-12" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="saida"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Saída (Horário)</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} className="text-base p-3 h-12" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="chegada"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Chegada (Horário)</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} className="text-base p-3 h-12" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <h3 className="text-xl font-semibold pt-4 border-t mt-6">Custos (R$)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="km"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">KM</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="0"
                        {...field}
                        className="text-base p-3 h-12"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField 
                control={form.control} 
                name="hpReais" 
                render={({ field }) => ( 
                  <FormItem> 
                    <FormLabel className="text-lg">Hora Parada</FormLabel> 
                    <FormControl><Input 
                        type="number" 
                        placeholder="Qntd de horas" 
                        {...field} 
                        className="text-base p-3 h-12" 
                    /></FormControl> 
                    <FormMessage /> 
                  </FormItem> 
                )} 
              />
              <FormField 
                control={form.control} 
                name="pedReais" 
                render={({ field }) => ( 
                  <FormItem> 
                    <FormLabel className="text-lg">Ped R$</FormLabel> 
                    <FormControl><Input 
                        type="number" 
                        placeholder="0,00" 
                        {...field} 
                        className="text-base p-3 h-12" 
                    /></FormControl> 
                    <FormMessage /> 
                  </FormItem> 
                )} 
              />
              <FormField 
                control={form.control} 
                name="estReais" 
                render={({ field }) => ( 
                  <FormItem> 
                    <FormLabel className="text-lg">Est R$</FormLabel> 
                    <FormControl><Input 
                        type="number" 
                        placeholder="0,00" 
                        {...field} 
                        className="text-base p-3 h-12" 
                    /></FormControl> 
                    <FormMessage /> 
                  </FormItem> 
                )} 
              />
            </div>
            
            <FormField
              control={form.control}
              name="assinatura"
              render={({ fieldState }) => (
                <FormItem>
                  <FormLabel className="text-lg">Assinatura</FormLabel>
                  <FormControl>
                    <div className={`border rounded-md p-0.5 bg-white focus-within:ring-2 focus-within:ring-ring ${fieldState.error ? 'border-destructive ring-destructive' : 'border-input'}`}>
                     {isClient && (
                        <div ref={containerRef} className="w-full">
                          <ReactSignatureCanvas
                            ref={sigCanvasRef}
                            penColor="black"
                            canvasProps={{
                              width: canvasWidth > 350 ? 350 : canvasWidth,
                              height: 100,
                              className: 'sigCanvas w-full h-auto rounded-md bg-white',
                            }}
                            onEnd={handleSignatureEnd}
                          />
                        </div>
                     )}
                    </div>
                  </FormControl>
                   <Button type="button" variant="outline" size="sm" onClick={clearSignature} className="mt-2">
                        <Trash2 className="mr-2 h-4 w-4" /> Limpar Assinatura
                   </Button>
                  {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dataAssinatura"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-lg">Data da Assinatura</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={`w-full justify-start text-left font-normal text-base p-3 h-12 ${
                            !field.value && "text-muted-foreground"
                          }`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "PPP", { locale: ptBR })
                          ) : (
                            <span>Escolha uma data</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => { if(date instanceof Date) field.onChange(date); }}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" size="lg" className="w-full text-lg py-7 bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting}>
              <Send className="mr-2 h-5 w-5" />
              {isSubmitting ? "Enviando..." : "Enviar para WhatsApp"}
            </Button>
          </form>
        </Form>
      </div>
    </section>
  );
}