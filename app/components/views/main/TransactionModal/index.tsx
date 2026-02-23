/**
 * @file components/views/main/TransactionModal/index.tsx
 * @description Transaction modal with state machine for voucher purchase flow
 */

"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { z } from "zod";
import { Phone, CheckCircle, Copy, AlertTriangle } from "lucide-react";
import { Button, Modal, Input } from "@/app/components/atoms";
import { formatCurrency } from "@/app/lib/utils";

// ==========================================
// TYPES
// ==========================================

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type TransactionStep = "input" | "review" | "payment" | "success";

interface TransactionState {
  step: TransactionStep;
  phoneNumber: string;
  voucherCode: string;
}

export interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

// ==========================================
// ZOD SCHEMA - Indonesian Phone Validation
// ==========================================

const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{7,10}$/;

const phoneNumberSchema = z
  .string()
  .min(1, "Nomor HP wajib diisi")
  .regex(phoneRegex, "Format nomor HP tidak valid (contoh: 08123456789)")
  .transform((val) => {
    if (val.startsWith("+62")) return "0" + val.slice(3);
    if (val.startsWith("62")) return "0" + val.slice(2);
    return val;
  });

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function generateVoucherCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 16; i++) {
    if (i > 0 && i % 4 === 0) code += "-";
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// ==========================================
// STEP 1: INPUT COMPONENT
// ==========================================

interface StepInputProps {
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  error: string;
  onNext: () => void;
  productName: string;
}

function StepInput({ phoneNumber, setPhoneNumber, error, onNext, productName }: StepInputProps) {
  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="text-center p-4 sm:p-6 bg-blue-50 rounded-2xl">
        <p className="text-xs sm:text-sm text-blue-600 font-medium">Produk Dipilih</p>
        <p className="text-base sm:text-lg font-bold text-gray-900 mt-1">{productName}</p>
      </div>

      <div>
        <Input
          label="Nomor HP"
          placeholder="Contoh: 08123456789"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          error={error}
          leftIcon={<Phone className="w-5 h-5" />}
          helperText="Kode voucher akan dikirim via SMS ke nomor ini"
        />
      </div>

      <Button fullWidth size="lg" onClick={onNext}>
        Lanjutkan
      </Button>
    </div>
  );
}

// ==========================================
// STEP 2: REVIEW COMPONENT
// ==========================================

interface StepReviewProps {
  product: Product;
  phoneNumber: string;
  onBack: () => void;
  onNext: () => void;
}

function StepReview({ product, phoneNumber, onBack, onNext }: StepReviewProps) {
  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 space-y-3 sm:space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Produk</span>
          <span className="font-semibold text-gray-900 text-sm sm:text-base">{product.name}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Harga</span>
          <span className="font-bold text-blue-600 text-base sm:text-lg">{formatCurrency(product.price)}</span>
        </div>
        <hr className="border-gray-200" />
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Nomor HP</span>
          <span className="font-semibold text-gray-900 text-sm sm:text-base">{phoneNumber}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" fullWidth onClick={onBack}>
          Kembali
        </Button>
        <Button fullWidth onClick={onNext}>
          Bayar Sekarang
        </Button>
      </div>
    </div>
  );
}

// ==========================================
// STEP 3: PAYMENT COMPONENT
// ==========================================

interface StepPaymentProps {
  product: Product;
  onPay: () => void;
  isProcessing: boolean;
}

function StepPayment({ product, onPay, isProcessing }: StepPaymentProps) {
  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="text-center">
        <p className="text-sm text-gray-500 mb-2">Total Pembayaran</p>
        <p className="text-2xl sm:text-3xl font-bold text-blue-600">{formatCurrency(product.price)}</p>
      </div>

      {/* QRIS Placeholder */}
      <div className="bg-gray-50 rounded-2xl p-6 sm:p-8">
        <div className="w-40 h-40 sm:w-48 sm:h-48 mx-auto bg-white border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center">
          <div className="text-center p-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-xl mx-auto mb-2 flex items-center justify-center">
              <span className="text-xl sm:text-2xl font-bold text-gray-400">QR</span>
            </div>
            <p className="text-xs text-gray-400">QRIS Midtrans</p>
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">Scan QR code di atas menggunakan aplikasi e-wallet atau mobile banking</p>
      </div>

      <Button fullWidth size="lg" onClick={onPay} isLoading={isProcessing}>
        {isProcessing ? "Memproses..." : "Saya Sudah Bayar"}
      </Button>
    </div>
  );
}

// ==========================================
// STEP 4: SUCCESS COMPONENT
// ==========================================

interface StepSuccessProps {
  product: Product;
  phoneNumber: string;
  voucherCode: string;
  countdown: number;
  onClose: () => void;
}

function StepSuccess({ product, phoneNumber, voucherCode, countdown, onClose }: StepSuccessProps) {
  const [copied, setCopied] = useState(false);

  const copyVoucherCode = async () => {
    try {
      await navigator.clipboard.writeText(voucherCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback untuk browser yang tidak support clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = voucherCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Success Icon */}
      <div className="text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Pembayaran Berhasil!</h3>
        <p className="text-sm text-gray-500 mt-1">Terima kasih telah membeli {product.name}</p>
      </div>

      {/* Warning - Screenshot Reminder */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 sm:p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-800 text-sm">Harap screenshot halaman ini!</p>
          <p className="text-xs text-amber-700 mt-0.5">Simpan bukti transaksi untuk jaga-jaga</p>
        </div>
      </div>

      {/* Voucher Code Display */}
      <div className="bg-blue-50 rounded-2xl p-4 sm:p-6 text-center">
        <p className="text-xs sm:text-sm text-blue-600 font-medium mb-2">Kode Voucher Anda</p>
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          <code className="text-lg sm:text-xl lg:text-2xl font-mono font-bold text-gray-900 tracking-wider break-all">{voucherCode}</code>
          <button onClick={copyVoucherCode} className="p-2 hover:bg-blue-100 rounded-xl transition-colors shrink-0" title="Salin kode">
            {copied ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 text-blue-600" />}
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gray-50 rounded-2xl p-4 sm:p-5">
        <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Cara Input Kode:</h4>
        <ol className="space-y-2 text-xs sm:text-sm text-gray-600">
          <li className="flex gap-2">
            <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
            <span>Buka aplikasi dialer/telepon di HP Anda</span>
          </li>
          <li className="flex gap-2">
            <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
            <span>Ketik *123*[KODE VOUCHER]# lalu tekan tombol panggil</span>
          </li>
          <li className="flex gap-2">
            <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
            <span>Tunggu konfirmasi dari operator</span>
          </li>
        </ol>
      </div>

      {/* SMS Notice */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-3 sm:p-4 flex items-start gap-3">
        <Phone className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-green-800 text-sm">Voucher juga telah dikirim via SMS</p>
          <p className="text-xs text-green-700 mt-0.5">Ke nomor: {phoneNumber}</p>
        </div>
      </div>

      {/* Countdown & Close Button */}
      <div className="text-center space-y-3">
        <p className="text-xs text-gray-400">
          Halaman ini akan otomatis tertutup dalam <span className="font-semibold">{countdown}</span> detik
        </p>
        <Button variant="outline" fullWidth onClick={onClose}>
          Tutup
        </Button>
      </div>
    </div>
  );
}

// ==========================================
// TRANSACTION MODAL (STATE MACHINE)
// ==========================================

export function TransactionModal({ isOpen, onClose, product }: TransactionModalProps) {
  const [state, setState] = useState<TransactionState>({
    step: "input",
    phoneNumber: "",
    voucherCode: "",
  });
  const [phoneError, setPhoneError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const shouldCloseRef = useRef(false);

  // Separate effect to handle the actual close action
  useEffect(() => {
    if (shouldCloseRef.current) {
      shouldCloseRef.current = false;
      onClose();
    }
  });

  // Auto-close countdown untuk step success
  useEffect(() => {
    if (state.step !== "success") return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          shouldCloseRef.current = true;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [state.step]);

  // Handler untuk step 1 -> step 2
  const handleInputNext = useCallback(() => {
    const result = phoneNumberSchema.safeParse(state.phoneNumber);
    if (!result.success) {
      setPhoneError(result.error.issues[0].message);
      return;
    }
    setPhoneError("");
    setState((prev) => ({
      ...prev,
      phoneNumber: result.data,
      step: "review",
    }));
  }, [state.phoneNumber]);

  // Handler untuk step 2 -> step 1
  const handleReviewBack = useCallback(() => {
    setState((prev) => ({ ...prev, step: "input" }));
  }, []);

  // Handler untuk step 2 -> step 3
  const handleReviewNext = useCallback(() => {
    setState((prev) => ({ ...prev, step: "payment" }));
  }, []);

  // Handler untuk step 3 -> step 4
  const handlePayment = useCallback(() => {
    setIsProcessing(true);
    // Simulasi proses pembayaran
    setTimeout(() => {
      setIsProcessing(false);
      setState((prev) => ({
        ...prev,
        step: "success",
        voucherCode: generateVoucherCode(),
      }));
      setCountdown(30);
    }, 2000);
  }, []);

  // Modal title berdasarkan step
  const modalTitle = useMemo(() => {
    switch (state.step) {
      case "input":
        return "Masukkan Nomor HP";
      case "review":
        return "Konfirmasi Pembelian";
      case "payment":
        return "Pembayaran";
      case "success":
        return "";
      default:
        return "";
    }
  }, [state.step]);

  // Jangan tampilkan close button di step success
  const showCloseButton = state.step !== "success";

  if (!product) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="md" showCloseButton={showCloseButton} closeOnOverlayClick={state.step !== "success"}>
      {state.step === "input" && <StepInput phoneNumber={state.phoneNumber} setPhoneNumber={(value) => setState((prev) => ({ ...prev, phoneNumber: value }))} error={phoneError} onNext={handleInputNext} productName={product.name} />}

      {state.step === "review" && <StepReview product={product} phoneNumber={state.phoneNumber} onBack={handleReviewBack} onNext={handleReviewNext} />}

      {state.step === "payment" && <StepPayment product={product} onPay={handlePayment} isProcessing={isProcessing} />}

      {state.step === "success" && <StepSuccess product={product} phoneNumber={state.phoneNumber} voucherCode={state.voucherCode} countdown={countdown} onClose={onClose} />}
    </Modal>
  );
}

export default TransactionModal;
