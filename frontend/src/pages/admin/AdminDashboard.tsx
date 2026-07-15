import { useState, useEffect, useCallback, useRef, Component, ErrorInfo, ReactNode } from "react";
import { Link, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import * as adminApi from "@/api/admin";
import type { Category, AdminProduct, AdminTopping, AdminStaff, AdminTable, AdminOrder, Settings } from "@/api/admin";

// ─── Shared UI helpers ─────────────────────────────────────────────────────────
function Spinner() {
  return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" /></div>;
}
function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="text-center py-16 text-gray-400">
      <div className="text-5xl mb-3">{icon}</div>
      <p className="text-sm">{text}</p>
    </div>
  );
}
function Badge({ ok, label }: { ok: boolean; label?: string }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ok ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
      {label ?? (ok ? "Còn hàng" : "Hết hàng")}
    </span>
  );
}
function Btn({ onClick, children, variant = "primary", size = "sm", disabled = false, type = "button" }: {
  onClick?: () => void; children: React.ReactNode;
  variant?: "primary" | "danger" | "ghost" | "outline"; size?: "sm" | "md";
  disabled?: boolean; type?: "button" | "submit";
}) {
  const base = "inline-flex items-center justify-center font-medium rounded-lg transition-colors disabled:opacity-50";
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm" };
  const variants = {
    primary: "bg-amber-600 text-white hover:bg-amber-700",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "text-gray-600 hover:bg-gray-100",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
  };
  return <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${sizes[size]} ${variants[variant]}`}>{children}</button>;
}
function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}
const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none";

// ─── Categories Section ────────────────────────────────────────────────────────
function AdminCategories() {
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", sort_order: "0" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setCats(await adminApi.fetchAdminCategories()); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm({ name: "", sort_order: "0" }); setEditing(null); setModal("create"); setError(null); };
  const openEdit = (c: Category) => { setForm({ name: c.name, sort_order: String(c.sort_order) }); setEditing(c); setModal("edit"); setError(null); };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true); setError(null);
    try {
      const payload = { name: form.name.trim(), sort_order: Number(form.sort_order) };
      if (modal === "create") { await adminApi.createCategory(payload); }
      else if (editing) { await adminApi.updateCategory(editing.id, payload); }
      setModal(null); await load();
    } catch (e: any) {
      setError(e.response?.data?.detail || "Lỗi không xác định");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa danh mục này? Các món thuộc danh mục sẽ bị ảnh hưởng.")) return;
    await adminApi.deleteCategory(id); await load();
  };
  const toggleActive = async (c: Category) => {
    await adminApi.updateCategory(c.id, { is_active: !c.is_active }); await load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold text-gray-900">Danh mục ({cats.length})</h2>
        <Btn onClick={openCreate} size="md">+ Thêm danh mục</Btn>
      </div>
      {loading ? <Spinner /> : cats.length === 0 ? <EmptyState icon="📂" text="Chưa có danh mục nào" /> : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>{["Tên", "Slug", "Thứ tự", "Trạng thái", ""].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-gray-700">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cats.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono">{c.slug}</td>
                  <td className="px-4 py-3 text-gray-500">{c.sort_order}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(c)}><Badge ok={c.is_active} label={c.is_active ? "Hiển thị" : "Ẩn"} /></button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <Btn onClick={() => openEdit(c)} variant="outline">Sửa</Btn>
                      <Btn onClick={() => handleDelete(c.id)} variant="danger">Xóa</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {modal && (
        <Modal title={modal === "create" ? "Thêm danh mục" : "Sửa danh mục"} onClose={() => setModal(null)}>
          <div className="space-y-4">
            {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}
            <FormField label="Tên danh mục *">
              <input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="VD: Cà phê" autoFocus />
            </FormField>
            <FormField label="Thứ tự hiển thị">
              <input className={inputCls} type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} />
            </FormField>
            <div className="flex gap-3 pt-2">
              <Btn onClick={handleSave} size="md" disabled={saving}>{saving ? "Đang lưu..." : "Lưu"}</Btn>
              <Btn onClick={() => setModal(null)} size="md" variant="outline">Hủy</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Toppings Section ──────────────────────────────────────────────────────────
function AdminToppings() {
  const [toppings, setToppings] = useState<AdminTopping[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<AdminTopping | null>(null);
  const [form, setForm] = useState({ name: "", price: "7000" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => { setLoading(true); try { setToppings(await adminApi.fetchAdminToppings()); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm({ name: "", price: "7000" }); setEditing(null); setModal("create"); setError(null); };
  const openEdit = (t: AdminTopping) => { setForm({ name: t.name, price: String(t.price) }); setEditing(t); setModal("edit"); setError(null); };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true); setError(null);
    try {
      const payload = { name: form.name.trim(), price: Number(form.price) };
      if (modal === "create") await adminApi.createTopping(payload);
      else if (editing) await adminApi.updateTopping(editing.id, payload);
      setModal(null); await load();
    } catch (e: any) { setError(e.response?.data?.detail || "Lỗi"); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa topping này?")) return;
    await adminApi.deleteTopping(id); await load();
  };

  const toggleAvail = async (t: AdminTopping) => {
    await adminApi.updateTopping(t.id, { is_available: !t.is_available }); await load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold text-gray-900">Topping ({toppings.length})</h2>
        <Btn onClick={openCreate} size="md">+ Thêm topping</Btn>
      </div>
      {loading ? <Spinner /> : toppings.length === 0 ? <EmptyState icon="🧃" text="Chưa có topping nào" /> : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>{["Tên", "Giá", "Trạng thái", ""].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-gray-700">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {toppings.map(t => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{t.name}</td>
                  <td className="px-4 py-3 text-gray-700">{t.price.toLocaleString()}đ</td>
                  <td className="px-4 py-3"><button onClick={() => toggleAvail(t)}><Badge ok={t.is_available} /></button></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <Btn onClick={() => openEdit(t)} variant="outline">Sửa</Btn>
                      <Btn onClick={() => handleDelete(t.id)} variant="danger">Xóa</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {modal && (
        <Modal title={modal === "create" ? "Thêm topping" : "Sửa topping"} onClose={() => setModal(null)}>
          <div className="space-y-4">
            {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}
            <FormField label="Tên topping *">
              <input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="VD: Trân châu đen" autoFocus />
            </FormField>
            <FormField label="Giá (VND)">
              <input className={inputCls} type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
            </FormField>
            <div className="flex gap-3 pt-2">
              <Btn onClick={handleSave} size="md" disabled={saving}>{saving ? "Đang lưu..." : "Lưu"}</Btn>
              <Btn onClick={() => setModal(null)} size="md" variant="outline">Hủy</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Staff Section ─────────────────────────────────────────────────────────────
function AdminStaffSection() {
  const [staffList, setStaffList] = useState<AdminStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"create" | "reset-pin" | null>(null);
  const [selected, setSelected] = useState<AdminStaff | null>(null);
  const [form, setForm] = useState({ staff_code: "", name: "", pin: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => { setLoading(true); try { setStaffList(await adminApi.fetchAdminStaff()); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.staff_code.trim() || !form.name.trim() || form.pin.length !== 6) {
      setError("Vui lòng điền đầy đủ. PIN phải đúng 6 số."); return;
    }
    setSaving(true); setError(null);
    try { await adminApi.createStaff({ staff_code: form.staff_code.toUpperCase(), name: form.name, pin: form.pin }); setModal(null); await load(); }
    catch (e: any) { setError(e.response?.data?.detail || "Lỗi"); } finally { setSaving(false); }
  };

  const handleResetPin = async () => {
    if (!selected || form.pin.length !== 6) { setError("PIN phải đúng 6 số"); return; }
    setSaving(true); setError(null);
    try { await adminApi.resetStaffPin(selected.id, form.pin); setModal(null); }
    catch (e: any) { setError(e.response?.data?.detail || "Lỗi"); } finally { setSaving(false); }
  };

  const toggleActive = async (s: AdminStaff) => { await adminApi.toggleStaffActive(s.id); await load(); };
  const handleDelete = async (s: AdminStaff) => {
    if (!confirm(`Vô hiệu hóa nhân viên ${s.name}?`)) return;
    await adminApi.deleteStaff(s.id); await load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold text-gray-900">Nhân viên ({staffList.length})</h2>
        <Btn onClick={() => { setForm({ staff_code: "", name: "", pin: "" }); setError(null); setModal("create"); }} size="md">+ Thêm nhân viên</Btn>
      </div>
      {loading ? <Spinner /> : staffList.length === 0 ? <EmptyState icon="👥" text="Chưa có nhân viên" /> : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>{["Mã NV", "Tên", "Trạng thái", ""].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-gray-700">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {staffList.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-medium text-gray-900">{s.staff_code}</td>
                  <td className="px-4 py-3 text-gray-900">{s.name}</td>
                  <td className="px-4 py-3"><button onClick={() => toggleActive(s)}><Badge ok={s.is_active} label={s.is_active ? "Active" : "Disabled"} /></button></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <Btn onClick={() => { setSelected(s); setForm(f => ({ ...f, pin: "" })); setError(null); setModal("reset-pin"); }} variant="outline">Reset PIN</Btn>
                      <Btn onClick={() => handleDelete(s)} variant="danger">Xóa</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {modal === "create" && (
        <Modal title="Thêm nhân viên" onClose={() => setModal(null)}>
          <div className="space-y-4">
            {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}
            <FormField label="Mã nhân viên *"><input className={inputCls} value={form.staff_code} onChange={e => setForm(f => ({ ...f, staff_code: e.target.value }))} placeholder="VD: NV03" autoFocus /></FormField>
            <FormField label="Họ và tên *"><input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="VD: Nguyễn Văn A" /></FormField>
            <FormField label="PIN (6 số) *"><input className={inputCls} type="password" maxLength={6} value={form.pin} onChange={e => setForm(f => ({ ...f, pin: e.target.value.replace(/\D/g, "") }))} placeholder="••••••" /></FormField>
            <div className="flex gap-3 pt-2">
              <Btn onClick={handleCreate} size="md" disabled={saving}>{saving ? "Đang tạo..." : "Tạo tài khoản"}</Btn>
              <Btn onClick={() => setModal(null)} size="md" variant="outline">Hủy</Btn>
            </div>
          </div>
        </Modal>
      )}
      {modal === "reset-pin" && selected && (
        <Modal title={`Reset PIN — ${selected.name}`} onClose={() => setModal(null)}>
          <div className="space-y-4">
            {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}
            <FormField label="PIN mới (6 số) *">
              <input className={inputCls} type="password" maxLength={6} value={form.pin} onChange={e => setForm(f => ({ ...f, pin: e.target.value.replace(/\D/g, "") }))} autoFocus placeholder="••••••" />
            </FormField>
            <div className="flex gap-3 pt-2">
              <Btn onClick={handleResetPin} size="md" disabled={saving}>{saving ? "Đang lưu..." : "Đặt PIN mới"}</Btn>
              <Btn onClick={() => setModal(null)} size="md" variant="outline">Hủy</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Tables Section ────────────────────────────────────────────────────────────
function AdminTablesSection() {
  const [tables, setTables] = useState<AdminTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"single" | "batch" | null>(null);
  const [form, setForm] = useState({ code: "" });
  const [batchForm, setBatchForm] = useState({ prefix: "B", start: "1", end: "10" });
  const [saving, setSaving] = useState(false);
  const [qrTable, setQrTable] = useState<AdminTable | null>(null);

  const BASE_URL = "http://localhost:5173";

  const load = useCallback(async () => { setLoading(true); try { setTables(await adminApi.fetchAdminTables()); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);

  const createSingle = async () => {
    if (!form.code.trim()) return;
    setSaving(true);
    try { await adminApi.createTable({ code: form.code.toUpperCase() }); setModal(null); await load(); }
    finally { setSaving(false); }
  };

  const createBatch = async () => {
    setSaving(true);
    try {
      await adminApi.createTablesBatch({ prefix: batchForm.prefix, start: Number(batchForm.start), end: Number(batchForm.end), padding: 2 });
      setModal(null); await load();
    } finally { setSaving(false); }
  };

  const toggleActive = async (t: AdminTable) => { await adminApi.updateTable(t.id, { is_active: !t.is_active }); await load(); };
  const handleDelete = async (id: string) => { if (!confirm("Xóa bàn này?")) return; await adminApi.deleteTable(id); await load(); };

  const downloadQR = (table: AdminTable) => {
    const url = `${BASE_URL}/?table=${table.code}`;
    // Create a canvas QR (simple implementation via API service)
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
    const a = document.createElement("a");
    a.href = qrApiUrl;
    a.download = `QR-Ban-${table.code}.png`;
    a.target = "_blank";
    a.click();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold text-gray-900">Bàn & QR ({tables.length})</h2>
        <div className="flex gap-2">
          <Btn onClick={() => { setModal("batch"); }} size="md" variant="outline">Thêm hàng loạt</Btn>
          <Btn onClick={() => { setForm({ code: "" }); setModal("single"); }} size="md">+ Thêm bàn</Btn>
        </div>
      </div>
      {loading ? <Spinner /> : tables.length === 0 ? <EmptyState icon="🪑" text="Chưa có bàn nào" /> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {tables.map(t => (
            <div key={t.id} className={`bg-white rounded-xl border p-4 text-center shadow-sm ${t.is_active ? "border-gray-200" : "border-gray-100 opacity-60"}`}>
              <div className="text-2xl font-bold text-gray-900 mb-1">{t.code}</div>
              <button onClick={() => toggleActive(t)} className="mb-3 block mx-auto">
                <Badge ok={t.is_active} label={t.is_active ? "Active" : "Inactive"} />
              </button>
              <div className="flex gap-1.5 justify-center">
                <Btn onClick={() => setQrTable(t)} variant="outline" size="sm">QR</Btn>
                <Btn onClick={() => handleDelete(t.id)} variant="danger" size="sm">Xóa</Btn>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal === "single" && (
        <Modal title="Thêm bàn" onClose={() => setModal(null)}>
          <div className="space-y-4">
            <FormField label="Mã bàn *"><input className={inputCls} value={form.code} onChange={e => setForm({ code: e.target.value })} placeholder="VD: B11" autoFocus /></FormField>
            <div className="flex gap-3 pt-2">
              <Btn onClick={createSingle} size="md" disabled={saving}>{saving ? "Đang tạo..." : "Tạo bàn"}</Btn>
              <Btn onClick={() => setModal(null)} size="md" variant="outline">Hủy</Btn>
            </div>
          </div>
        </Modal>
      )}
      {modal === "batch" && (
        <Modal title="Thêm bàn hàng loạt" onClose={() => setModal(null)}>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Tạo nhiều bàn theo dãy số. VD: B01, B02, ... B10</p>
            <div className="grid grid-cols-3 gap-3">
              <FormField label="Tiền tố"><input className={inputCls} value={batchForm.prefix} onChange={e => setBatchForm(f => ({ ...f, prefix: e.target.value }))} /></FormField>
              <FormField label="Từ số"><input className={inputCls} type="number" value={batchForm.start} onChange={e => setBatchForm(f => ({ ...f, start: e.target.value }))} /></FormField>
              <FormField label="Đến số"><input className={inputCls} type="number" value={batchForm.end} onChange={e => setBatchForm(f => ({ ...f, end: e.target.value }))} /></FormField>
            </div>
            <p className="text-xs text-amber-600">→ Sẽ tạo: {batchForm.prefix}{String(Number(batchForm.start)).padStart(2, "0")} ... {batchForm.prefix}{String(Number(batchForm.end)).padStart(2, "0")}</p>
            <div className="flex gap-3 pt-2">
              <Btn onClick={createBatch} size="md" disabled={saving}>{saving ? "Đang tạo..." : "Tạo hàng loạt"}</Btn>
              <Btn onClick={() => setModal(null)} size="md" variant="outline">Hủy</Btn>
            </div>
          </div>
        </Modal>
      )}
      {qrTable && (
        <Modal title={`QR Code — Bàn ${qrTable.code}`} onClose={() => setQrTable(null)}>
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">URL: {`http://localhost:5173/?table=${qrTable.code}`}</p>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`http://localhost:5173/?table=${qrTable.code}`)}`}
              alt={`QR bàn ${qrTable.code}`}
              className="mx-auto rounded-xl border border-gray-200 p-3"
            />
            <div className="mt-5 flex gap-3 justify-center">
              <Btn onClick={() => downloadQR(qrTable)} size="md">⬇ Tải PNG</Btn>
              <Btn onClick={() => setQrTable(null)} size="md" variant="outline">Đóng</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Orders Section ────────────────────────────────────────────────────────────
const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending_payment: { label: "Chờ TT", color: "bg-yellow-100 text-yellow-700" },
  confirmed: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-700" },
  preparing: { label: "Đang làm", color: "bg-orange-100 text-orange-700" },
  completed: { label: "Hoàn thành", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Hủy", color: "bg-red-100 text-red-700" },
  expired: { label: "Hết hạn", color: "bg-gray-100 text-gray-500" },
};

function AdminOrdersSection() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await adminApi.fetchAdminOrders({ status: statusFilter || undefined, limit: 100 });
      setOrders(resp.orders);
    } finally { setLoading(false); }
  }, [statusFilter]);
  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="flex items-center gap-4 mb-5">
        <h2 className="text-xl font-semibold text-gray-900">Đơn hàng</h2>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-amber-500 outline-none">
          <option value="">Tất cả</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <Btn onClick={load} variant="ghost">↻ Làm mới</Btn>
      </div>
      {loading ? <Spinner /> : orders.length === 0 ? <EmptyState icon="📦" text="Không có đơn hàng" /> : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>{["Mã đơn", "Bàn", "Trạng thái", "TT", "Tổng", "Tạo lúc"].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-gray-700 whitespace-nowrap">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map(o => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">{o.order_code}</td>
                  <td className="px-4 py-3 text-gray-700">{o.table_code || "Mang đi"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_LABELS[o.status]?.color || "bg-gray-100 text-gray-500"}`}>
                      {STATUS_LABELS[o.status]?.label || o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{o.payment_method === "vietqr" ? "QR" : "Tiền mặt"}</td>
                  <td className="px-4 py-3 font-semibold text-amber-700">{o.total_amount.toLocaleString()}đ</td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{new Date(o.created_at).toLocaleString("vi-VN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Settings Section ──────────────────────────────────────────────────────────
function AdminSettingsSection() {
  const [settings, setSettings] = useState<Settings>({
    shop_name: "", shop_phone: "", shop_address: "",
    bank_name: "", bank_bin: "", bank_account_no: "", bank_account_name: "", bank_branch: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi.fetchSettings().then(data => { setSettings(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true); setError(null); setSuccess(false);
    try {
      await adminApi.updateSettings(settings);
      setSuccess(true); setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) { setError(e.response?.data?.detail || "Lỗi lưu cấu hình"); } finally { setSaving(false); }
  };

  if (loading) return <Spinner />;

  const Field = ({ label, field, placeholder = "" }: { label: string; field: keyof Settings; placeholder?: string }) => (
    <FormField label={label}>
      <input className={inputCls} value={settings[field]} placeholder={placeholder}
        onChange={e => setSettings(s => ({ ...s, [field]: e.target.value }))} />
    </FormField>
  );

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Cấu hình quán</h2>
      {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg mb-4">{error}</div>}
      {success && <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg mb-4">✓ Đã lưu thành công</div>}
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h3 className="font-semibold text-gray-800">Thông tin quán</h3>
          <Field label="Tên quán" field="shop_name" placeholder="Tiệm Cafe Góc Nhỏ" />
          <Field label="Số điện thoại" field="shop_phone" placeholder="0901234567" />
          <Field label="Địa chỉ" field="shop_address" placeholder="123 Đường ABC, TP.HCM" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h3 className="font-semibold text-gray-800">Thông tin ngân hàng (VietQR)</h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Tên ngân hàng" field="bank_name" placeholder="Vietcombank" />
            <Field label="Mã BIN" field="bank_bin" placeholder="970436" />
          </div>
          <Field label="Số tài khoản" field="bank_account_no" placeholder="1234567890" />
          <Field label="Tên chủ tài khoản" field="bank_account_name" placeholder="NGUYEN VAN A" />
          <Field label="Chi nhánh" field="bank_branch" placeholder="TP.HCM" />
        </div>
        <Btn onClick={handleSave} size="md" disabled={saving}>{saving ? "Đang lưu..." : "Lưu cấu hình"}</Btn>
      </div>
    </div>
  );
}

// ─── Products Section ──────────────────────────────────────────────────────────
function AdminProducts() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState("");
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [toppings, setToppings] = useState<AdminTopping[]>([]);

  const emptyForm = { name: "", category_id: "", description: "", has_sugar: true, has_ice: true, sort_order: "0", sizes: [{ size: "M", price: "30000" }], topping_ids: [] as string[] };
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [prods, cats, tops] = await Promise.all([adminApi.fetchAdminProducts(catFilter ? { category_id: catFilter } : {}), adminApi.fetchAdminCategories(), adminApi.fetchAdminToppings()]);
      setProducts(prods); setCategories(cats); setToppings(tops);
    } finally { setLoading(false); }
  }, [catFilter]);
  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setForm({ ...emptyForm, category_id: categories[0]?.id ?? "" });
    setEditing(null); setModal("create"); setError(null);
  };

  const openEdit = (p: AdminProduct) => {
    setEditing(p);
    setForm({
      name: p.name, category_id: p.category_id, description: p.description ?? "",
      has_sugar: p.has_sugar_option, has_ice: p.has_ice_option, sort_order: String(p.sort_order),
      sizes: p.variants.length ? p.variants.map(v => ({ size: v.size, price: String(v.price) })) : [{ size: "M", price: "30000" }],
      topping_ids: p.toppings.map(t => t.id),
    });
    setModal("edit"); setError(null);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.category_id) { setError("Tên món và danh mục là bắt buộc"); return; }
    if (form.sizes.some(s => !s.size || !s.price)) { setError("Vui lòng điền đầy đủ size và giá"); return; }
    setSaving(true); setError(null);
    const payload = {
      category_id: form.category_id, name: form.name.trim(), description: form.description || undefined,
      has_sugar_option: form.has_sugar, has_ice_option: form.has_ice, sort_order: Number(form.sort_order),
      variant_prices: Object.fromEntries(form.sizes.map(s => [s.size, Number(s.price)])),
      topping_ids: form.topping_ids,
    };
    try {
      if (modal === "create") await adminApi.createProduct(payload);
      else if (editing) await adminApi.updateProduct(editing.id, payload);
      setModal(null); await load();
    } catch (e: any) { setError(e.response?.data?.detail || "Lỗi"); } finally { setSaving(false); }
  };

  const handleToggle = async (p: AdminProduct) => { await adminApi.toggleProductAvailability(p.id); await load(); };
  const handleDelete = async (id: string) => { if (!confirm("Xóa món này?")) return; await adminApi.deleteProduct(id); await load(); };

  const handleImageUpload = async (productId: string, file: File) => {
    setUploadingFor(productId);
    try { await adminApi.uploadProductImage(productId, file); await load(); }
    catch (e: any) { alert(e.response?.data?.detail || "Lỗi upload ảnh"); }
    finally { setUploadingFor(null); }
  };

  const addSize = () => setForm(f => ({ ...f, sizes: [...f.sizes, { size: "", price: "" }] }));
  const removeSize = (i: number) => setForm(f => ({ ...f, sizes: f.sizes.filter((_, idx) => idx !== i) }));
  const toggleTopping = (id: string) => setForm(f => ({
    ...f, topping_ids: f.topping_ids.includes(id) ? f.topping_ids.filter(x => x !== id) : [...f.topping_ids, id],
  }));

  const filteredProducts = catFilter ? products.filter(p => p.category_id === catFilter) : products;

  return (
    <div>
      <div className="flex items-center gap-4 mb-5 flex-wrap">
        <h2 className="text-xl font-semibold text-gray-900">Món ({filteredProducts.length})</h2>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-amber-500 outline-none">
          <option value="">Tất cả danh mục</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <Btn onClick={openCreate} size="md">+ Thêm món</Btn>
      </div>
      {loading ? <Spinner /> : filteredProducts.length === 0 ? <EmptyState icon="🍽️" text="Chưa có món nào" /> : (
        <div className="space-y-3">
          {filteredProducts.map(p => {
            const cat = categories.find(c => c.id === p.category_id);
            return (
              <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
                {/* Image */}
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 relative">
                  {p.primary_image_url ? (
                    <img src={`http://localhost:8000${p.primary_image_url}`} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Chưa có ảnh</div>
                  )}
                  <label className="absolute inset-0 cursor-pointer opacity-0 hover:opacity-100 bg-black/40 flex items-center justify-center transition-opacity">
                    <span className="text-white text-xs">{uploadingFor === p.id ? "..." : "📷"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleImageUpload(p.id, e.target.files[0])} disabled={uploadingFor !== null} />
                  </label>
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900">{p.name}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{cat?.name}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {p.variants.map(v => `${v.size}: ${v.price.toLocaleString()}đ`).join(" · ")}
                  </div>
                  <div className="flex gap-2 mt-1.5 flex-wrap">
                    {p.has_sugar_option && <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">Đường</span>}
                    {p.has_ice_option && <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">Đá</span>}
                    {p.toppings.map(t => <span key={t.id} className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded">{t.name}</span>)}
                  </div>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => handleToggle(p)}><Badge ok={p.is_available} /></button>
                  <Btn onClick={() => openEdit(p)} variant="outline">Sửa</Btn>
                  <Btn onClick={() => handleDelete(p.id)} variant="danger">Xóa</Btn>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <Modal title={modal === "create" ? "Thêm món mới" : "Sửa món"} onClose={() => setModal(null)}>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}
            <FormField label="Tên món *">
              <input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="VD: Cà phê sữa" autoFocus />
            </FormField>
            <FormField label="Danh mục *">
              <select className={inputCls} value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}>
                <option value="">Chọn danh mục</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </FormField>
            <FormField label="Mô tả">
              <textarea className={inputCls} rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Mô tả ngắn về món..." />
            </FormField>
            {/* Sizes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Size & Giá *</label>
              <div className="space-y-2">
                {form.sizes.map((s, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <select className="w-20 px-2 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-500"
                      value={s.size} onChange={e => setForm(f => ({ ...f, sizes: f.sizes.map((x, idx) => idx === i ? { ...x, size: e.target.value } : x) }))}>
                      <option value="">Size</option>
                      {["S", "M", "L"].map(sz => <option key={sz} value={sz}>{sz}</option>)}
                    </select>
                    <input className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-500" type="number" value={s.price}
                      placeholder="Giá VND" onChange={e => setForm(f => ({ ...f, sizes: f.sizes.map((x, idx) => idx === i ? { ...x, price: e.target.value } : x) }))} />
                    {form.sizes.length > 1 && <button onClick={() => removeSize(i)} className="text-red-400 hover:text-red-600 px-1">✕</button>}
                  </div>
                ))}
                {form.sizes.length < 3 && <button onClick={addSize} className="text-amber-600 text-sm hover:underline">+ Thêm size</button>}
              </div>
            </div>
            {/* Options */}
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={form.has_sugar} onChange={e => setForm(f => ({ ...f, has_sugar: e.target.checked }))} className="rounded" />
                Tùy chọn đường
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={form.has_ice} onChange={e => setForm(f => ({ ...f, has_ice: e.target.checked }))} className="rounded" />
                Tùy chọn đá
              </label>
            </div>
            {/* Toppings */}
            {toppings.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Topping có thể thêm</label>
                <div className="flex flex-wrap gap-2">
                  {toppings.map(t => (
                    <button key={t.id} type="button" onClick={() => toggleTopping(t.id)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${form.topping_ids.includes(t.id) ? "bg-amber-500 border-amber-500 text-white" : "border-gray-300 text-gray-600 hover:border-amber-400"}`}>
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <FormField label="Thứ tự hiển thị">
              <input className={inputCls} type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} />
            </FormField>
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-100 mt-4">
            <Btn onClick={handleSave} size="md" disabled={saving}>{saving ? "Đang lưu..." : "Lưu món"}</Btn>
            <Btn onClick={() => setModal(null)} size="md" variant="outline">Hủy</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Dashboard Home ────────────────────────────────────────────────────────────
function DashboardHome() {
  const [stats, setStats] = useState({ orders_today: "—", revenue_today: "—", total_products: "—", active_staff: "—" });

  useEffect(() => {
    Promise.all([adminApi.fetchAdminOrders({ limit: 500 }), adminApi.fetchAdminStaff(), adminApi.fetchAdminProducts({})])
      .then(([orders, staff, products]) => {
        const today = new Date().toDateString();
        const todayOrders = orders.orders.filter(o => new Date(o.created_at).toDateString() === today && o.status !== "cancelled");
        const revenue = todayOrders.filter(o => o.status === "completed" || o.status === "preparing").reduce((s, o) => s + o.total_amount, 0);
        setStats({
          orders_today: String(todayOrders.length),
          revenue_today: revenue > 0 ? revenue.toLocaleString() + "đ" : "0đ",
          total_products: String(products.length),
          active_staff: String(staff.filter(s => s.is_active).length),
        });
      }).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Đơn hôm nay", value: stats.orders_today, color: "text-blue-600", icon: "📦" },
          { label: "Doanh thu hôm nay", value: stats.revenue_today, color: "text-green-600", icon: "💰" },
          { label: "Món trong menu", value: stats.total_products, color: "text-amber-600", icon: "🍽️" },
          { label: "Nhân viên active", value: stats.active_staff, color: "text-purple-600", icon: "👥" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-gray-500 text-sm">Chào mừng đến trang quản trị <strong>Tiệm Cafe Góc Nhỏ</strong>. Dùng sidebar để điều hướng giữa các tính năng.</p>
      </div>
    </div>
  );
}

// ─── Change Password Page ──────────────────────────────────────────────────────
function ChangePasswordPage() {
  const navigate = useNavigate();
  const { logout, changePassword } = useAuthStore();
  // Use uncontrolled refs so browser automation key events work
  const oldPwRef = useRef<HTMLInputElement>(null);
  const newPwRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const oldPassword = oldPwRef.current?.value ?? "";
    const newPassword = newPwRef.current?.value ?? "";
    const confirm = confirmRef.current?.value ?? "";
    if (newPassword !== confirm) { setError("Mật khẩu xác nhận không khớp"); return; }
    if (newPassword.length < 8) { setError("Mật khẩu mới phải có ít nhất 8 ký tự"); return; }
    setSaving(true); setError(null);
    const ok = await changePassword(oldPassword, newPassword);
    setSaving(false);
    if (ok) {
      navigate("/admin/dashboard", { replace: true });
    } else {
      setError("Đổi mật khẩu thất bại — kiểm tra lại mật khẩu cũ");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🔐</div>
          <h1 className="text-xl font-bold text-gray-900">Đổi mật khẩu lần đầu</h1>
          <p className="text-sm text-gray-500 mt-1">Vui lòng đổi mật khẩu mặc định trước khi sử dụng</p>
        </div>
        {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg mb-4">{error}</div>}
        <div className="space-y-4">
          <FormField label="Mật khẩu cũ">
            <input id="old-password" type="password" className={inputCls} ref={oldPwRef} defaultValue="" placeholder="Mật khẩu hiện tại" autoFocus />
          </FormField>
          <FormField label="Mật khẩu mới (tối thiểu 8 ký tự)">
            <input id="new-password" type="password" className={inputCls} ref={newPwRef} defaultValue="" placeholder="Tối thiểu 8 ký tự" />
          </FormField>
          <FormField label="Xác nhận mật khẩu mới">
            <input id="confirm-password" type="password" className={inputCls} ref={confirmRef} defaultValue="" placeholder="Nhập lại mật khẩu mới" />
          </FormField>
          <button id="change-pw-btn" onClick={handleSubmit} disabled={saving} className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors mt-2">
            {saving ? "Đang đổi..." : "Đổi mật khẩu"}
          </button>
          <button onClick={() => { logout(); navigate("/admin"); }} className="w-full text-sm text-gray-400 hover:text-gray-600 py-2">Đăng xuất</button>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar config ────────────────────────────────────────────────────────────
const sidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: "📊", path: "/admin" },
  { id: "categories", label: "Danh mục", icon: "📂", path: "/admin/categories" },
  { id: "products", label: "Món", icon: "🍽️", path: "/admin/products" },
  { id: "toppings", label: "Topping", icon: "🧃", path: "/admin/toppings" },
  { id: "staff", label: "Nhân viên", icon: "👥", path: "/admin/staff" },
  { id: "tables", label: "Bàn & QR", icon: "🪑", path: "/admin/tables" },
  { id: "orders", label: "Đơn hàng", icon: "📦", path: "/admin/orders" },
  { id: "settings", label: "Cấu hình", icon: "⚙️", path: "/admin/settings" },
];

// ─── Main AdminDashboard ───────────────────────────────────────────────────────
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("AdminDashboard Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center p-4">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Đã xảy ra lỗi giao diện</h1>
          <pre className="bg-white p-4 rounded-lg shadow border border-red-200 text-red-800 max-w-full overflow-auto">
            {this.state.error?.message}
          </pre>
          <button onClick={() => window.location.href = "/admin"} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg">Thử lại</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AdminDashboardInner() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, mustChangePassword, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { navigate("/admin"); return; }
    if (mustChangePassword && location.pathname !== "/admin/change-password") {
      navigate("/admin/change-password");
    }
  }, [isAuthenticated, mustChangePassword, location.pathname, navigate]);

  const currentSection = location.pathname.split("/")[2] || "dashboard";

  // Change password page — full screen
  if (location.pathname === "/admin/change-password") {
    return <ChangePasswordPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
          <div>
            <h2 className="font-bold text-gray-900 text-sm">☕ Cafe Góc Nhỏ</h2>
            <p className="text-xs text-gray-400 mt-0.5">Trang quản trị</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {sidebarItems.map(item => (
            <Link key={item.id} to={item.path} onClick={() => setSidebarOpen(false)}
              className={`w-full text-left px-3 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center gap-3 ${currentSection === item.id || (item.id === "dashboard" && currentSection === "admin") ? "bg-amber-50 text-amber-900 border border-amber-200" : "text-gray-700 hover:bg-gray-50"}`}>
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-200">
          <button onClick={() => { logout(); navigate("/admin"); }}
            className="w-full text-left px-3 py-2.5 rounded-lg font-medium text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3">
            <span>🚪</span> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <h1 className="text-base font-semibold text-gray-900">
                {sidebarItems.find(i => i.id === currentSection)?.label || "Dashboard"}
              </h1>
            </div>
            <Link to="/" className="text-sm text-amber-600 hover:text-amber-700 font-medium px-3 py-1.5 rounded-lg hover:bg-amber-50 transition-colors">
              ← Về Menu
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="dashboard" element={<DashboardHome />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="toppings" element={<AdminToppings />} />
            <Route path="staff" element={<AdminStaffSection />} />
            <Route path="tables" element={<AdminTablesSection />} />
            <Route path="orders" element={<AdminOrdersSection />} />
            <Route path="settings" element={<AdminSettingsSection />} />
            <Route path="change-password" element={<ChangePasswordPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <ErrorBoundary>
      <AdminDashboardInner />
    </ErrorBoundary>
  );
}
