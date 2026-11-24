import { useState, useEffect } from "react";
import {
  getMyGroups,
  createGroup,
  joinGroup,
  errorMessage,
  type Group,
} from "../lib/api";

export default function GroupsView() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const [newGroupName, setNewGroupName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Cargar grupos reales desde el backend
  async function fetchGroups() {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await getMyGroups();
      setGroups(data);
    } catch (err) {
      setLoadError(errorMessage(err, "No pudimos cargar tus grupos."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim() || joining) return;

    setJoining(true);
    setJoinError(null);
    try {
      await joinGroup(joinCode.trim().toUpperCase());
      setJoinCode("");
      await fetchGroups(); // Recargar la lista de grupos
    } catch (err) {
      setJoinError(errorMessage(err, "No pudimos unirte al grupo. Verificá el código."));
    } finally {
      setJoining(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || creating) return;

    setCreating(true);
    setCreateError(null);
    try {
      await createGroup(newGroupName.trim());
      setNewGroupName("");
      await fetchGroups(); // Recargar la lista de grupos
    } catch (err) {
      setCreateError(errorMessage(err, "No pudimos crear el grupo."));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="border-b border-che-line/50 pb-3">
        <h1 className="font-serif text-2xl font-normal tracking-tight text-che-ink">
          Mis Grupos en <span className="italic">Che</span>
        </h1>
        <p className="text-xs text-che-ink-soft">
          Organizá avisos y recordatorios compartidos con tu equipo, familia o amigos.
        </p>
      </div>

      {/* Grid de Acciones Principales: Crear y Unirme */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Crear un nuevo grupo */}
        <div className="flex flex-col justify-between rounded-2xl border border-che-line/60 bg-che-bg/40 p-4 space-y-3">
          <div>
            <h2 className="font-serif text-base font-medium text-che-ink">
              Crear nuevo grupo
            </h2>
            <p className="text-[11px] text-che-ink-soft">
              Creá un espacio compartido para enviar alertas a todos sus miembros.
            </p>
          </div>
          <form onSubmit={handleCreateGroup} className="space-y-2 pt-1">
            <div className="flex gap-2">
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Ej: Casa, Oficina, Facultad..."
                className="w-full rounded-2xl border-[1.5px] border-che-line bg-che-paper px-3 py-2 text-sm text-che-ink focus:border-che-ink focus:outline-none"
                disabled={creating}
                required
              />
              <button
                type="submit"
                disabled={creating}
                className="whitespace-nowrap rounded-2xl bg-[#c85a32] px-4 py-2 font-sans text-xs font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {creating ? "Creando…" : "Crear"}
              </button>
            </div>
            {createError && (
              <p className="text-[11px] font-medium text-[#B91C1C]">{createError}</p>
            )}
          </form>
        </div>

        {/* Unirme a un grupo */}
        <div className="flex flex-col justify-between rounded-2xl border border-che-line/60 bg-che-bg/40 p-4 space-y-3">
          <div>
            <h2 className="font-serif text-base font-medium text-che-ink">
              Unirme a un grupo
            </h2>
            <p className="text-[11px] text-che-ink-soft">
              Ingresá el código de invitación que te compartieron.
            </p>
          </div>
          <form onSubmit={handleJoinGroup} className="space-y-2 pt-1">
            <div className="flex gap-2">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Ej: CHE-8X2K9"
                className="w-full rounded-2xl border-[1.5px] border-che-line bg-che-paper px-3 py-2 text-sm text-che-ink tracking-wider font-mono focus:border-che-ink focus:outline-none"
                maxLength={10}
                disabled={joining}
                required
              />
              <button
                type="submit"
                disabled={joining}
                className="whitespace-nowrap rounded-2xl bg-[#1c2a22] px-4 py-2 font-sans text-xs font-semibold text-[#f4efe6] hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {joining ? "Uniéndome…" : "Unirme"}
              </button>
            </div>
            {joinError && (
              <p className="text-[11px] font-medium text-[#B91C1C]">{joinError}</p>
            )}
          </form>
        </div>

      </div>

      {/* Lista de Grupos Activos */}
      <div className="space-y-3">
        <h2 className="font-serif text-lg font-medium text-che-ink">
          Grupos a los que pertenecés
        </h2>

        {loading ? (
          <div className="py-6 text-center text-xs text-che-ink-soft">
            Cargando tus grupos…
          </div>
        ) : loadError ? (
          <div className="rounded-2xl border border-che-line/60 bg-che-bg/40 p-4 text-center space-y-2">
            <p className="text-xs font-medium text-[#B91C1C]">{loadError}</p>
            <button
              type="button"
              onClick={fetchGroups}
              className="rounded-full border border-che-line bg-che-paper px-3 py-1 text-xs font-semibold text-che-ink hover:border-che-ink transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : groups.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-che-line/80 p-6 text-center text-xs text-che-ink-soft">
            Todavía no formás parte de ningún grupo. Creá uno o unite con un código.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {groups.map((group) => (
              <div
                key={group.id}
                className="rounded-2xl border border-che-line/70 bg-che-paper p-4 space-y-3 shadow-2xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-serif text-base font-semibold text-che-ink">
                      {group.name}
                    </h3>
                    <p className="text-[11px] text-che-ink-soft">
                      {group.membersCount} {group.membersCount === 1 ? "miembro activo" : "miembros activos"}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      group.role === "ADMIN"
                        ? "bg-[#c85a32]/10 text-[#c85a32]"
                        : "bg-che-line/40 text-che-ink-soft"
                    }`}
                  >
                    {group.role === "ADMIN" ? "Administrador" : "Miembro"}
                  </span>
                </div>

                {/* Código de invitación con botón de copiar */}
                <div className="flex items-center justify-between rounded-xl bg-che-bg px-3 py-2 border border-che-line/40">
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-bold text-che-ink-soft">
                      Código de invitación
                    </span>
                    <span className="font-mono text-xs font-bold text-che-ink">
                      {group.code}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(group.code)}
                    className="text-xs font-semibold text-[#c85a32] hover:underline"
                  >
                    {copiedCode === group.code ? "¡Copiado!" : "Copiar"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}