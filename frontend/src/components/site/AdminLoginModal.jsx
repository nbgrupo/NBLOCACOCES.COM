import React, { useState } from "react";
import axios from "axios";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminLoginModal({ onSuccess, onClose }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/admin/login`, { username, password });
      toast.success("Acesso autorizado!");
      onSuccess(data.token);
    } catch (err) {
      const detail = err.response?.data?.detail || "Erro ao conectar com o servidor.";
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-testid="admin-login-overlay"
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        data-testid="admin-login-modal"
        className="w-full max-w-sm rounded-2xl glass-dark border border-white/10 p-8"
      >
        <div className="flex flex-col items-center gap-3 mb-7">
          <div className="h-12 w-12 rounded-full bg-accent-nb/10 flex items-center justify-center">
            <Lock className="h-5 w-5 text-accent-nb" />
          </div>
          <h2 className="font-display font-bold text-xl text-white">Painel Admin</h2>
          <p className="text-sm text-white/50 text-center">Digite suas credenciais para acessar as configurações.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-white/60">Usuário</Label>
            <Input
              data-testid="admin-login-username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Admin"
              className="bg-[#0e0e0f] border-white/10 text-white"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-white/60">Senha</Label>
            <div className="relative">
              <Input
                data-testid="admin-login-password"
                type={showPass ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-[#0e0e0f] border-white/10 text-white pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80"
                aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p data-testid="admin-login-error" className="text-sm text-red-400 text-center">
              {error}
            </p>
          )}

          <Button
            data-testid="admin-login-submit"
            type="submit"
            disabled={loading}
            className="w-full bg-accent-nb text-[#0a0a0a] hover:bg-accent-nb/90 font-semibold mt-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
