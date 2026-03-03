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
import { TransactionAPI, type TransactionRecord, type TransactionPayment } from "@/app/service/transaction/api";

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

type TransactionStep = "input" | "review" | "payment" | "success" | "error";

interface TransactionState {
  step: TransactionStep;
  phoneNumber: string;
  voucherCode: string;
  transactionId: string;
  payment: TransactionPayment | null;
  errorMessage: string;
}

export interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  /** When provided, the modal opens directly on the success step (e.g. after a Midtrans finish redirect) */
  initialTransaction?: TransactionRecord | null;
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

// (removed generateVoucherCode — voucher code now comes from the API)

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
  isLoading?: boolean;
}

function StepReview({ product, phoneNumber, onBack, onNext, isLoading }: StepReviewProps) {
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
        <Button variant="outline" fullWidth onClick={onBack} disabled={isLoading}>
          Kembali
        </Button>
        <Button fullWidth onClick={onNext} isLoading={isLoading}>
          {isLoading ? "Memproses..." : "Bayar Sekarang"}
        </Button>
      </div>
    </div>
  );
}

// ==========================================
// SNAP.JS LOADER HOOK
// ==========================================

/**
 * Injects the Midtrans Snap.js script once and resolves when ready.
 * Client key is fetched from /api/config/payment to avoid embedding it in the bundle.
 */
function useSnapScript() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Already loaded
    if ((window as unknown as Record<string, unknown>).snap) {
      // Use queueMicrotask to avoid synchronous setState inside effect
      queueMicrotask(() => setReady(true));
      return;
    }

    // Fetch the public client key from our server
    fetch("/api/config/payment")
      .then((r) => r.json())
      .then(({ clientKey, isProduction }: { clientKey: string; isProduction: boolean }) => {
        const script = document.createElement("script");
        script.src = isProduction ? "https://app.midtrans.com/snap/snap.js" : "https://app.sandbox.midtrans.com/snap/snap.js";
        script.setAttribute("data-client-key", clientKey);
        script.onload = () => setReady(true);
        document.head.appendChild(script);
      })
      .catch((err) => console.error("Failed to load Snap.js", err));
  }, []);

  return ready;
}

// ==========================================
// STEP 3: PAYMENT COMPONENT (Snap popup)
// ==========================================

interface StepPaymentProps {
  product: Product;
  snapToken: string;
  onSuccess: (result: unknown) => void;
  onPending: (result: unknown) => void;
  onError: (result: unknown) => void;
  onClose: () => void;
}

function StepPayment({ product, snapToken, onSuccess, onPending, onError, onClose }: StepPaymentProps) {
  const snapReady = useSnapScript();
  const openedRef = useRef(false);

  // Open the Snap popup once the script is ready and we have a token
  useEffect(() => {
    if (!snapReady || !snapToken || openedRef.current) return;
    openedRef.current = true;

    (
      window as unknown as {
        snap: {
          pay: (
            token: string,
            options: {
              onSuccess: (r: unknown) => void;
              onPending: (r: unknown) => void;
              onError: (r: unknown) => void;
              onClose: () => void;
            },
          ) => void;
        };
      }
    ).snap.pay(snapToken, {
      onSuccess,
      onPending,
      onError,
      onClose,
    });
  }, [snapReady, snapToken, onSuccess, onPending, onError, onClose]);

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="text-center">
        <p className="text-sm text-gray-500 mb-2">Total Pembayaran</p>
        <p className="text-2xl sm:text-3xl font-bold text-blue-600">{formatCurrency(product.price)}</p>
      </div>

      <div className="bg-blue-50 rounded-2xl p-6 text-center space-y-3">
        {snapReady ? (
          <>
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-7 h-7 text-blue-600" />
            </div>
            <p className="font-semibold text-gray-900">Halaman pembayaran telah dibuka</p>
            <p className="text-sm text-gray-500">Selesaikan pembayaran pada popup Midtrans yang muncul.</p>
          </>
        ) : (
          <>
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <div className="w-6 h-6 bg-gray-300 rounded-full" />
            </div>
            <p className="font-semibold text-gray-900">Memuat halaman pembayaran...</p>
          </>
        )}
      </div>

      <p className="text-center text-xs text-gray-400">
        Popup tidak muncul?{" "}
        <button
          className="text-blue-600 underline font-medium"
          onClick={() => {
            openedRef.current = false;
          }}
        >
          Buka ulang
        </button>
      </p>
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
  transaction: TransactionRecord | null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function StepSuccess({ product, phoneNumber, voucherCode, countdown, onClose, transaction: _transaction }: StepSuccessProps) {
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

export function TransactionModal({ isOpen, onClose, product, initialTransaction }: TransactionModalProps) {
  const [state, setState] = useState<TransactionState>({
    step: initialTransaction ? "success" : "input",
    phoneNumber: initialTransaction?.phoneNumber ?? "",
    voucherCode: initialTransaction?.voucher?.code ?? "",
    transactionId: initialTransaction?.id ?? "",
    payment: null,
    errorMessage: "",
  });
  const [phoneError, setPhoneError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdown, setCountdown] = useState(30);
  // Hold real transaction record once confirmed
  const [confirmedTransaction, setConfirmedTransaction] = useState<TransactionRecord | null>(initialTransaction ?? null);
  const shouldCloseRef = useRef(false);

  // Separate effect to handle the actual close action
  useEffect(() => {
    if (shouldCloseRef.current) {
      shouldCloseRef.current = false;
      onClose();
    }
  });

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setState({
        step: "input",
        phoneNumber: "",
        voucherCode: "",
        transactionId: "",
        payment: null,
        errorMessage: "",
      });
      setPhoneError("");
      setIsProcessing(false);
      setCountdown(30);
      setConfirmedTransaction(null);
    } else if (initialTransaction) {
      // Opened via Midtrans redirect — jump straight to success step
      setState({
        step: "success",
        phoneNumber: initialTransaction.phoneNumber ?? "",
        voucherCode: initialTransaction.voucher?.code ?? "",
        transactionId: initialTransaction.id,
        payment: null,
        errorMessage: "",
      });
      setConfirmedTransaction(initialTransaction);
      setCountdown(30);
    }
  }, [isOpen, initialTransaction]);

  // Auto-close countdown for success step
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

  // Step 1 → Step 2: validate phone
  const handleInputNext = useCallback(() => {
    const result = phoneNumberSchema.safeParse(state.phoneNumber);
    if (!result.success) {
      setPhoneError(result.error.issues[0].message);
      return;
    }
    setPhoneError("");
    setState((prev) => ({ ...prev, phoneNumber: result.data, step: "review" }));
  }, [state.phoneNumber]);

  // Step 2 → Step 1
  const handleReviewBack = useCallback(() => {
    setState((prev) => ({ ...prev, step: "input" }));
  }, []);

  // Step 2 → Step 3: call POST /api/transactions (initiate + reserve voucher)
  const handleReviewNext = useCallback(async () => {
    if (!product) return;
    setIsProcessing(true);
    try {
      const res = await TransactionAPI.initiate({
        productId: product.id,
        phoneNumber: state.phoneNumber,
      });
      const { transaction, payment } = res.data.data;
      setState((prev) => ({
        ...prev,
        step: "payment",
        transactionId: transaction.id,
        payment,
      }));
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? "Gagal membuat transaksi, coba lagi";
      setState((prev) => ({ ...prev, step: "error", errorMessage: message }));
    } finally {
      setIsProcessing(false);
    }
  }, [product, state.phoneNumber]);

  // Step 3 → Step 4: Snap callbacks fired by Midtrans popup
  const handleSnapSuccess = useCallback(
    async (_result: unknown) => {
      void _result;
      if (!state.transactionId) return;
      setIsProcessing(true);
      try {
        const res = await TransactionAPI.confirm(state.transactionId);
        const confirmed = res.data.data;
        setConfirmedTransaction(confirmed);
        setState((prev) => ({
          ...prev,
          step: "success",
          voucherCode: confirmed.voucher?.code ?? "",
        }));
        setCountdown(30);
      } catch (err: unknown) {
        const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? "Konfirmasi pembayaran gagal";
        setState((prev) => ({ ...prev, step: "error", errorMessage: message }));
      } finally {
        setIsProcessing(false);
      }
    },
    [state.transactionId],
  );

  const handleSnapPending = useCallback((_result: unknown) => {
    void _result;
    // Bank-transfer / pending payment — webhook will confirm later
    setState((prev) => ({
      ...prev,
      step: "error",
      errorMessage: "Pembayaran sedang diproses. Kami akan mengirim notifikasi setelah pembayaran dikonfirmasi.",
    }));
  }, []);

  const handleSnapError = useCallback(
    async (_result: unknown) => {
      void _result;
      if (state.transactionId) {
        await TransactionAPI.cancel(state.transactionId).catch(() => null);
      }
      setState((prev) => ({
        ...prev,
        step: "error",
        errorMessage: "Pembayaran gagal. Silakan coba lagi.",
      }));
    },
    [state.transactionId],
  );

  const handleSnapClose = useCallback(async () => {
    // User dismissed the Snap popup without paying
    if (state.transactionId && state.step === "payment") {
      await TransactionAPI.cancel(state.transactionId).catch(() => null);
      setState((prev) => ({
        ...prev,
        step: "error",
        errorMessage: "Pembayaran dibatalkan. Silakan coba lagi jika ingin melanjutkan.",
      }));
    }
  }, [state.transactionId, state.step]);

  // Error step: retry from the beginning
  const handleRetry = useCallback(() => {
    setState((prev) => ({
      ...prev,
      step: "input",
      transactionId: "",
      payment: null,
      errorMessage: "",
      voucherCode: "",
    }));
    setConfirmedTransaction(null);
  }, []);

  // Modal title per step
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
      case "error":
        return "Transaksi Gagal";
      default:
        return "";
    }
  }, [state.step]);

  const showCloseButton = state.step !== "success";

  if (!product) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="md" showCloseButton={showCloseButton} closeOnOverlayClick={state.step !== "success"}>
      {state.step === "input" && <StepInput phoneNumber={state.phoneNumber} setPhoneNumber={(value) => setState((prev) => ({ ...prev, phoneNumber: value }))} error={phoneError} onNext={handleInputNext} productName={product.name} />}

      {state.step === "review" && <StepReview product={product} phoneNumber={state.phoneNumber} onBack={handleReviewBack} onNext={handleReviewNext} isLoading={isProcessing} />}

      {state.step === "payment" && <StepPayment product={product} snapToken={state.payment?.token ?? ""} onSuccess={handleSnapSuccess} onPending={handleSnapPending} onError={handleSnapError} onClose={handleSnapClose} />}

      {state.step === "success" && <StepSuccess product={product} phoneNumber={state.phoneNumber} voucherCode={state.voucherCode} countdown={countdown} onClose={onClose} transaction={confirmedTransaction} />}

      {state.step === "error" && (
        <div className="space-y-5 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Transaksi Gagal</h3>
            <p className="text-sm text-gray-500 mt-1">{state.errorMessage}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={onClose}>
              Tutup
            </Button>
            <Button fullWidth onClick={handleRetry}>
              Coba Lagi
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default TransactionModal;
