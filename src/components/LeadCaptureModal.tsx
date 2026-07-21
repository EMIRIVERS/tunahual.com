import { useState, memo, useCallback, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Phone, Loader2 } from "lucide-react";
import { z } from "zod";
import { TermsModal } from "./TermsModal";
import { NahualPreview } from "./NahualPreview";
import { ValidatedInput } from "./ValidatedInput";
import { MayanKinDB } from "@/utils/mayanCalculations";

const countryCodes = [
  { code: "+52", country: "México", flag: "🇲🇽" },
  { code: "+1", country: "Estados Unidos", flag: "🇺🇸" },
  { code: "+502", country: "Guatemala", flag: "🇬🇹" },
  { code: "+34", country: "España", flag: "🇪🇸" },
  { code: "+57", country: "Colombia", flag: "🇨🇴" },
  { code: "+54", country: "Argentina", flag: "🇦🇷" },
  { code: "+55", country: "Brasil", flag: "🇧🇷" },
  { code: "+56", country: "Chile", flag: "🇨🇱" },
  { code: "+51", country: "Perú", flag: "🇵🇪" },
  { code: "+58", country: "Venezuela", flag: "🇻🇪" },
  { code: "+593", country: "Ecuador", flag: "🇪🇨" },
  { code: "+591", country: "Bolivia", flag: "🇧🇴" },
  { code: "+595", country: "Paraguay", flag: "🇵🇾" },
  { code: "+598", country: "Uruguay", flag: "🇺🇾" },
  { code: "+503", country: "El Salvador", flag: "🇸🇻" },
  { code: "+504", country: "Honduras", flag: "🇭🇳" },
  { code: "+505", country: "Nicaragua", flag: "🇳🇮" },
  { code: "+506", country: "Costa Rica", flag: "🇨🇷" },
  { code: "+507", country: "Panamá", flag: "🇵🇦" },
  { code: "+53", country: "Cuba", flag: "🇨🇺" },
  { code: "+1809", country: "Rep. Dominicana", flag: "🇩🇴" },
  { code: "+1787", country: "Puerto Rico", flag: "🇵🇷" },
  { code: "+44", country: "Reino Unido", flag: "🇬🇧" },
  { code: "+49", country: "Alemania", flag: "🇩🇪" },
  { code: "+33", country: "Francia", flag: "🇫🇷" },
  { code: "+39", country: "Italia", flag: "🇮🇹" },
  { code: "+351", country: "Portugal", flag: "🇵🇹" },
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+81", country: "Japón", flag: "🇯🇵" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "other", country: "Otra...", flag: "🌍" },
];

const leadSchema = z.object({
  nombre: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  email: z.string().trim().email("Ingresa un email válido").max(255),
  countryCode: z.string().min(1, "Selecciona un código de país"),
  customCountryCode: z.string().optional(),
  telefono: z.string().trim().min(6, "Ingresa un número de WhatsApp válido").max(15).regex(/^[0-9]+$/, "Solo números"),
  acceptTerms: z.literal(true, { errorMap: () => ({ message: "Debes aceptar los términos y condiciones" }) }),
}).refine((data) => {
  if (data.countryCode === "other" && data.telefono) {
    return data.customCountryCode && data.customCountryCode.startsWith("+") && data.customCountryCode.length >= 2;
  }
  return true;
}, {
  message: "Ingresa un código de país válido (ej: +123)",
  path: ["customCountryCode"],
});

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (nombre: string, email: string, telefono: string) => void;
  isSubmitting: boolean;
  nahualPreview?: MayanKinDB;
}

export const LeadCaptureModal = memo(function LeadCaptureModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isSubmitting,
  nahualPreview
}: LeadCaptureModalProps) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+52");
  const [customCountryCode, setCustomCountryCode] = useState("");
  const [telefono, setTelefono] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<{ nombre?: string; email?: string; countryCode?: string; customCountryCode?: string; telefono?: string; acceptTerms?: string }>({});
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [touched, setTouched] = useState<{ nombre?: boolean; email?: boolean; telefono?: boolean }>({});

  // Validation states for micro-feedback
  const validations = useMemo(() => ({
    nombre: nombre.trim().length >= 2,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()),
    telefono: telefono.length >= 6,
  }), [nombre, email, telefono]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = leadSchema.safeParse({ nombre, email, countryCode, customCountryCode, telefono, acceptTerms });
    
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof typeof fieldErrors;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    const finalCountryCode = countryCode === "other" ? customCountryCode : countryCode;
    const fullPhone = `${finalCountryCode}${telefono}`;
    onSubmit(result.data.nombre, result.data.email, fullPhone);
  }, [nombre, email, countryCode, customCountryCode, telefono, acceptTerms, onSubmit]);

  const handleTelefonoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTelefono(e.target.value.replace(/\D/g, ''));
  }, []);

  const handleBlur = useCallback((field: keyof typeof touched) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-card border-primary/20 rounded-3xl overflow-hidden shadow-2xl shadow-primary/10 max-h-[90vh] overflow-y-auto">
        {/* Simple gradient background - no heavy animations */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none" />

        <div className="relative z-10 animate-fade-in space-y-4">
          <DialogHeader className="text-center space-y-3 pb-2 pt-2">
            <p className="text-[0.65rem] uppercase tracking-[0.25em] text-primary/70 font-medium">
              Tu lectura del Cholq'ij
            </p>
            <DialogTitle className="font-serif text-3xl font-semibold text-foreground">
              Recibe tu lectura
            </DialogTitle>

            {/* Nahual Preview */}
            {nahualPreview && <NahualPreview result={nahualPreview} />}

            <p className="text-sm text-muted-foreground leading-relaxed">
              Te enviamos tu lectura completa por correo para que vuelvas a tu
              mapa maya cuando lo necesites.
            </p>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-sm font-medium text-foreground">
                Nombre *
              </Label>
              <ValidatedInput
                id="nombre"
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                onBlur={() => handleBlur('nombre')}
                disabled={isSubmitting}
                isValid={validations.nombre}
                showValidation={!!touched.nombre && nombre.length > 0}
                icon={<User className="w-4 h-4" />}
              />
              {errors.nombre && (
                <p className="text-xs text-destructive animate-fade-in">
                  {errors.nombre}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email *
              </Label>
              <ValidatedInput
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur('email')}
                disabled={isSubmitting}
                isValid={validations.email}
                showValidation={!!touched.email && email.length > 0}
                icon={<Mail className="w-4 h-4" />}
              />
              {errors.email && (
                <p className="text-xs text-destructive animate-fade-in">
                  {errors.email}
                </p>
              )}
            </div>

            {/* WhatsApp */}
            <div className="space-y-2">
              <Label htmlFor="telefono" className="text-sm font-medium text-foreground">
                WhatsApp *
              </Label>
              <div className="flex gap-2">
                <Select value={countryCode} onValueChange={setCountryCode} disabled={isSubmitting}>
                  <SelectTrigger className="w-[100px] rounded-full bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border z-50 max-h-[300px]">
                    {countryCodes.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        <span className="flex items-center gap-2">
                          <span>{country.flag}</span>
                          <span className="text-xs">{country.code === "other" ? "Otra" : country.code}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {countryCode === "other" && (
                  <ValidatedInput
                    type="text"
                    placeholder="+123"
                    value={customCountryCode}
                    onChange={(e) => setCustomCountryCode(e.target.value)}
                    className="w-20"
                    disabled={isSubmitting}
                    isValid={customCountryCode.startsWith("+") && customCountryCode.length >= 2}
                    showValidation={customCountryCode.length > 0}
                  />
                )}

                <ValidatedInput
                  id="telefono"
                  type="tel"
                  placeholder="12345678"
                  value={telefono}
                  onChange={handleTelefonoChange}
                  onBlur={() => handleBlur('telefono')}
                  disabled={isSubmitting}
                  isValid={validations.telefono}
                  showValidation={!!touched.telefono && telefono.length > 0}
                  icon={<Phone className="w-4 h-4" />}
                  className="flex-1"
                />
              </div>
              {(errors.countryCode || errors.telefono || errors.customCountryCode) && (
                <p className="text-xs text-destructive animate-fade-in">
                  {errors.countryCode || errors.customCountryCode || errors.telefono}
                </p>
              )}
            </div>

            {/* Términos y condiciones */}
            <div className="space-y-2">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-muted/50 border border-border/50">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                  disabled={isSubmitting}
                  className="mt-0.5 data-[state=checked]:bg-primary"
                />
                <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                  Acepto los{" "}
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowTermsModal(true);
                    }}
                    className="text-primary underline hover:no-underline"
                  >
                    términos y condiciones
                  </button>{" "}
                  y la{" "}
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowTermsModal(true);
                    }}
                    className="text-primary underline hover:no-underline"
                  >
                    política de privacidad
                  </button>
                  . *
                </Label>
              </div>
              {errors.acceptTerms && (
                <p className="text-xs text-destructive animate-fade-in">
                  {errors.acceptTerms}
                </p>
              )}
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                variant="cta"
                className="w-full rounded-full py-6 text-base font-medium"
              >
                <span className="flex items-center justify-center gap-2">
                  {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                  {isSubmitting ? "Consultando el calendario sagrado..." : "Revelar mi lectura"}
                </span>
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
      <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
    </Dialog>
  );
});
