// Export interface/type
export type * from './api/kelas';
export type * from './api/jurusan';
export type * from './api/kategori';
export type * from './api/labor';
export type * from './api/users';
export type * from './api/perangkat';
export type * from './api/item-instance';
export type * from './api/peminjaman'; // 👈 Tambahan baru

// Export objek API runtime
export { apiKelas } from './api/kelas';
export { apiJurusan } from './api/jurusan';
export { apiKategori } from './api/kategori';
export { apiLabor } from './api/labor';
export { apiUsers } from './api/users';
export { apiPerangkat } from './api/perangkat';
export { apiItemInstance } from './api/item-instance';
export { apiPeminjaman } from './api/peminjaman'; // 👈 Tambahan baru