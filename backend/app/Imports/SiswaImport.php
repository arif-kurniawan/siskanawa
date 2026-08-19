<?php

namespace App\Imports;

use App\Models\Jurusan;
use App\Models\Kelas;
use App\Models\Siswa;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Facades\DB;

class SiswaImport implements ToCollection, WithHeadingRow
{
    public array $berhasil = [];
    public array $gagal = [];
    public array $dilewati = [];

    // Cache jurusan & kelas supaya tidak query berulang
    private array $jurusanMap = [];
    private array $kelasMap = [];

    public function __construct()
    {
        // Peta kode jurusan → id (huruf besar untuk pencocokan konsisten)
        $this->jurusanMap = Jurusan::pluck('id', 'kode')
            ->mapWithKeys(fn ($id, $kode) => [strtoupper($kode) => $id])
            ->toArray();

        // Peta nama kelas → id. Pakai accessor nama_lengkap kalau ada,
        // fallback ke kolom nama.
        foreach (Kelas::with('jurusan')->get() as $kelas) {
            $nama = $kelas->nama_lengkap ?? $kelas->nama ?? null;
            if ($nama) {
                $this->kelasMap[strtoupper(trim($nama))] = $kelas->id;
            }
        }
    }

    public function collection(Collection $rows): void
    {
        foreach ($rows as $index => $row) {
            $nomorBaris = $index + 2; // +2: header di baris 1, index mulai 0

            // Lewati baris kosong
            if (empty($row['nis']) && empty($row['nama'])) {
                continue;
            }

            $hasil = $this->prosesBaris($row, $nomorBaris);
            // hasil sudah dicatat di dalam prosesBaris
            unset($hasil);
        }
    }

    private function prosesBaris($row, int $nomorBaris): void
    {
        $nis = trim((string) ($row['nis'] ?? ''));
        $nama = trim((string) ($row['nama'] ?? ''));

        // Validasi wajib minimal
        $errorField = [];
        if ($nama === '') $errorField[] = 'nama kosong';
        if ($nis === '') $errorField[] = 'nis kosong';

        // NIS sudah ada → lewati (anti-duplikat)
        if ($nis !== '' && Siswa::where('nis', $nis)->exists()) {
            $this->dilewati[] = ['baris' => $nomorBaris, 'nis' => $nis, 'alasan' => 'NIS sudah terdaftar'];
            return;
        }

        // Terjemahkan jurusan_kode → id
        $jurusanKode = strtoupper(trim((string) ($row['jurusan_kode'] ?? '')));
        $jurusanId = $this->jurusanMap[$jurusanKode] ?? null;
        if (! $jurusanId) {
            $errorField[] = "jurusan '{$jurusanKode}' tidak ditemukan";
        }

        // Terjemahkan kelas_nama → id (opsional)
        $kelasId = null;
        $kelasNama = strtoupper(trim((string) ($row['kelas_nama'] ?? '')));
        if ($kelasNama !== '') {
            $kelasId = $this->kelasMap[$kelasNama] ?? null;
            if (! $kelasId) {
                $errorField[] = "kelas '{$kelasNama}' tidak ditemukan";
            }
        }

        // Validasi jenis kelamin
        $jk = strtoupper(trim((string) ($row['jenis_kelamin'] ?? '')));
        if (! in_array($jk, ['L', 'P'])) {
            $errorField[] = 'jenis_kelamin harus L atau P';
        }

        // Validasi agama
        $agama = strtolower(trim((string) ($row['agama'] ?? '')));
        $agamaValid = ['islam', 'kristen', 'katolik', 'hindu', 'buddha', 'konghucu'];
        if (! in_array($agama, $agamaValid)) {
            $errorField[] = "agama '{$agama}' tidak valid";
        }

        // Tanggal lahir
        $tanggalLahir = $this->parseTanggal($row['tanggal_lahir'] ?? null);
        if (! $tanggalLahir) {
            $errorField[] = 'tanggal_lahir tidak valid (format YYYY-MM-DD)';
        }

        // Kalau ada error, catat & berhenti
        if (! empty($errorField)) {
            $this->gagal[] = [
                'baris' => $nomorBaris,
                'nis' => $nis,
                'nama' => $nama,
                'alasan' => implode('; ', $errorField),
            ];
            return;
        }

        // Semua valid → buat siswa dalam transaksi
        try {
            DB::transaction(function () use ($row, $nama, $nis, $jurusanId, $kelasId, $jk, $agama, $tanggalLahir) {
                $email = trim((string) ($row['email'] ?? '')) ?: $nis . '@siswa.smkn9malang.sch.id';
                $password = \Carbon\Carbon::parse($tanggalLahir)->format('dmY');

                $user = User::create([
                    'name' => $nama,
                    'email' => $email,
                    'password' => Hash::make($password),
                ]);
                $user->assignRole('siswa');

                Siswa::create([
                    'user_id' => $user->id,
                    'nis' => $nis,
                    'nisn' => trim((string) ($row['nisn'] ?? '')) ?: null,
                    'jurusan_id' => $jurusanId,
                    'kelas_id' => $kelasId,
                    'jenis_kelamin' => $jk,
                    'tempat_lahir' => trim((string) ($row['tempat_lahir'] ?? '')),
                    'tanggal_lahir' => $tanggalLahir,
                    'agama' => $agama,
                    'alamat' => trim((string) ($row['alamat'] ?? '')),
                    'no_hp' => trim((string) ($row['no_hp'] ?? '')) ?: null,
                    'angkatan' => (int) ($row['angkatan'] ?? date('Y')),
                    'status' => 'aktif',
                ]);
            });

            $this->berhasil[] = ['baris' => $nomorBaris, 'nis' => $nis, 'nama' => $nama];
        } catch (\Throwable $e) {
            $this->gagal[] = [
                'baris' => $nomorBaris,
                'nis' => $nis,
                'nama' => $nama,
                'alasan' => 'Gagal simpan: ' . $e->getMessage(),
            ];
        }
    }

    // Terima tanggal dalam bentuk string YYYY-MM-DD atau serial Excel
    private function parseTanggal($nilai): ?string
    {
        if (empty($nilai)) return null;

        try {
            // Kalau angka (serial Excel), konversi
            if (is_numeric($nilai)) {
                $tgl = \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject((float) $nilai);
                return $tgl->format('Y-m-d');
            }
            // Kalau string
            return \Carbon\Carbon::parse((string) $nilai)->format('Y-m-d');
        } catch (\Throwable $e) {
            return null;
        }
    }
}