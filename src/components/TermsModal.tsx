import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { FileText, Shield, Mail } from "lucide-react";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermsModal({ isOpen, onClose }: TermsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] bg-background border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="w-5 h-5 text-primary" />
            Términos y Condiciones
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 text-sm text-muted-foreground"
          >
            <section className="space-y-3">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                1. Información General
              </h3>
              <p>
                Bienvenido a Azul Anaité. Al utilizar nuestro servicio de cálculo del Nahual Maya, 
                aceptas los siguientes términos y condiciones. Este servicio está diseñado para 
                proporcionar información sobre el calendario sagrado Maya Cholq'ij con fines 
                educativos y de autoconocimiento.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-base font-semibold text-foreground">
                2. Uso del Servicio
              </h3>
              <p>
                El cálculo del Nahual Maya se basa en el calendario tradicional Cholq'ij de 260 días. 
                La información proporcionada tiene un propósito orientativo y espiritual. No 
                pretende sustituir consejos profesionales de ningún tipo.
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>El servicio es gratuito para uso personal</li>
                <li>Los resultados son generados automáticamente basados en algoritmos tradicionales</li>
                <li>Cada usuario es responsable de la interpretación de su resultado</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-base font-semibold text-foreground">
                3. Recopilación de Datos
              </h3>
              <p>
                Al utilizar nuestro servicio, recopilamos la siguiente información:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Nombre:</strong> Para personalizar tu experiencia</li>
                <li><strong>Correo electrónico:</strong> Para comunicaciones relacionadas con el servicio</li>
                <li><strong>Teléfono:</strong> Para contacto opcional sobre servicios adicionales</li>
                <li><strong>Fecha de nacimiento:</strong> Necesaria para el cálculo del Nahual Maya</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-base font-semibold text-foreground">
                4. Privacidad y Protección de Datos
              </h3>
              <p>
                Nos comprometemos a proteger tu información personal:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Tus datos se almacenan de forma segura y encriptada</li>
                <li>No vendemos ni compartimos tu información con terceros sin tu consentimiento</li>
                <li>Puedes solicitar la eliminación de tus datos en cualquier momento</li>
                <li>Utilizamos tu correo únicamente para enviarte información sobre tu Nahual y servicios relacionados</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-base font-semibold text-foreground">
                5. Comunicaciones
              </h3>
              <p>
                Al proporcionar tu información de contacto, aceptas recibir:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Tu lectura del Nahual Maya</li>
                <li>Información sobre el calendario Cholq'ij</li>
                <li>Ofertas de servicios relacionados con espiritualidad maya (opcional)</li>
              </ul>
              <p>
                Puedes darte de baja de nuestras comunicaciones en cualquier momento.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-base font-semibold text-foreground">
                6. Propiedad Intelectual
              </h3>
              <p>
                El contenido, diseño y funcionalidad de este sitio son propiedad de Azul Anaité. 
                La sabiduría del calendario Maya es patrimonio cultural de los pueblos originarios 
                de Mesoamérica, y la honramos con respeto y gratitud.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                7. Contacto
              </h3>
              <p>
                Para cualquier pregunta sobre estos términos o sobre el uso de tus datos, 
                puedes contactarnos a través de nuestros canales oficiales.
              </p>
            </section>

            <section className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground/70">
                Última actualización: Enero 2026
              </p>
            </section>
          </motion.div>
        </ScrollArea>

        <div className="pt-4">
          <Button onClick={onClose} className="w-full rounded-full">
            Entendido
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
