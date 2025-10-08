"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage, type SupportedLanguage } from "@/hooks/use-language";
import type { UserRole } from "@/lib/mocks/users";

type ProfileSnapshot = {
  firstName: string;
  lastName: string;
  username: string;
  phone: string;
  email: string;
  address: string;
};

type ProfileCopy = {
  header: {
    title: string;
    description: string;
    sectionTitle: string;
    sectionDescription: string;
  };
  sidebar: {
    title: string;
    account: string;
    orders: string;
    ordersHint: string;
  };
  actions: {
    logout: string;
    update: string;
    upload: string;
    remove: string;
    changePassword: string;
    changeAddress: string;
  };
  form: {
    labels: {
      firstName: string;
      lastName: string;
      username: string;
      phone: string;
      email: string;
      password: string;
    };
    hints: {
      firstName: string;
      username: string;
      phone: string;
      email: string;
      password: string;
      address: string;
    };
    address: {
      title: string;
      label: string;
      placeholderName: string;
      description: string;
    };
    passwordPlaceholder: string;
  };
};

type RoleKey = UserRole | "user";

const dictionary: Record<SupportedLanguage, Record<RoleKey, ProfileCopy>> = {
  id: {
    user: {
      header: {
        title: "Profil Pengguna",
        description:
          "Kelola informasi akun pribadi, pantau pesanan, serta lihat detail pesan dalam satu tempat.",
        sectionTitle: "Akun Pengguna",
        sectionDescription:
          "Simpan dan perbarui detail akun Anda, seperti nama, email, nomor telepon, dan alamat.",
      },
      sidebar: {
        title: "Menu",
        account: "Akun",
        orders: "Pesanan",
        ordersHint: "Riwayat pesanan segera hadir",
      },
      actions: {
        logout: "Keluar",
        update: "Perbarui Profil",
        upload: "Unggah Gambar",
        remove: "Hapus",
        changePassword: "Ubah Password",
        changeAddress: "Ubah Alamat",
      },
      form: {
        labels: {
          firstName: "Nama Depan",
          lastName: "Nama Belakang",
          username: "Username",
          phone: "Nomor Telepon",
          email: "Email",
          password: "Password",
        },
        hints: {
          firstName: "Gunakan nama asli karena akan tercantum pada resi/invoice.",
          username: "Username akan tampil saat Anda mengirim komentar dan ulasan.",
          phone: "Masukkan nomor aktif untuk mempermudah kurir menghubungi Anda.",
          email: "Bukti transaksi akan dikirimkan ke alamat email yang Anda gunakan.",
          password:
            "Ubah kata sandi Anda secara berkala untuk menjaga keamanan akun.",
          address:
            "Pastikan alamat yang Anda masukkan benar agar pengiriman lebih cepat dan tepat.",
        },
        address: {
          title: "Alamat",
          label: "Rumah - {name}",
          placeholderName: "Example User",
          description:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In scelerisque tempor nisl, et imperdiet est tristique vel. Pellentesque elit turpis, vulputate vel orci et, imperdiet mollis tortor.",
        },
        passwordPlaceholder: "********",
      },
    },
    admin: {
      header: {
        title: "Profil Admin",
        description:
          "Perbarui data admin dan pantau aktivitas pengelolaan sistem dengan mudah.",
        sectionTitle: "Akun Admin",
        sectionDescription:
          "Informasi kontak admin digunakan untuk komunikasi internal dan koordinasi tim.",
      },
      sidebar: {
        title: "Menu",
        account: "Data Admin",
        orders: "Laporan",
        ordersHint: "Integrasi laporan segera hadir",
      },
      actions: {
        logout: "Keluar",
        update: "Simpan Perubahan",
        upload: "Unggah Foto",
        remove: "Hapus Foto",
        changePassword: "Atur Password",
        changeAddress: "Atur Alamat",
      },
      form: {
        labels: {
          firstName: "Nama Depan",
          lastName: "Nama Belakang",
          username: "Kode Admin",
          phone: "Nomor Kantor",
          email: "Email Admin",
          password: "Password",
        },
        hints: {
          firstName: "Gunakan nama resmi sesuai data internal.",
          username: "Kode admin akan tampil pada catatan sistem.",
          phone: "Nomor kantor digunakan untuk komunikasi operasional.",
          email: "Email admin menerima notifikasi penting dari sistem.",
          password:
            "Rutin perbarui password demi keamanan akses admin.",
          address:
            "Alamat kantor membantu proses pengiriman dokumen fisik.",
        },
        address: {
          title: "Alamat Kantor",
          label: "Kantor Pusat - {name}",
          placeholderName: "Admin KenBike",
          description:
            "Jl. Merdeka No. 123, Jakarta Pusat. Gedung KenBike Lantai 3.",
        },
        passwordPlaceholder: "********",
      },
    },
    owner: {
      header: {
        title: "Profil Owner",
        description:
          "Kelola informasi pemilik untuk memantau performa bisnis dan mitra.",
        sectionTitle: "Akun Owner",
        sectionDescription:
          "Detail ini digunakan untuk laporan strategis dan komunikasi dengan manajemen.",
      },
      sidebar: {
        title: "Menu",
        account: "Informasi Owner",
        orders: "Ringkasan Bisnis",
        ordersHint: "Dashboard bisnis segera tersedia",
      },
      actions: {
        logout: "Keluar",
        update: "Simpan Profil",
        upload: "Unggah Foto",
        remove: "Hapus Foto",
        changePassword: "Kelola Password",
        changeAddress: "Kelola Alamat",
      },
      form: {
        labels: {
          firstName: "Nama Depan",
          lastName: "Nama Belakang",
          username: "Kode Owner",
          phone: "Nomor Kontak",
          email: "Email Bisnis",
          password: "Password",
        },
        hints: {
          firstName: "Pastikan nama sesuai dokumen legal bisnis.",
          username: "Kode owner digunakan pada laporan keuangan.",
          phone: "Nomor kontak memudahkan konsultan menghubungi Anda.",
          email: "Gunakan email bisnis aktif untuk menerima laporan performa.",
          password:
            "Disarankan mengganti password secara berkala demi keamanan aset.",
          address:
            "Alamat bisnis digunakan untuk korespondensi dan audit.",
        },
        address: {
          title: "Alamat Bisnis",
          label: "Kantor Operasional - {name}",
          placeholderName: "Owner KenBike",
          description:
            "Jl. Kebon Sirih No. 45, Jakarta Pusat. Area operasional utama KenBike.",
        },
        passwordPlaceholder: "********",
      },
    },
  },
  en: {
    user: {
      header: {
        title: "User Profile",
        description:
          "Manage your personal account details, track orders, and keep everything organised in one place.",
        sectionTitle: "User Account",
        sectionDescription:
          "Update core details such as name, email, phone number, and delivery address.",
      },
      sidebar: {
        title: "Menu",
        account: "Account",
        orders: "Orders",
        ordersHint: "Order history coming soon",
      },
      actions: {
        logout: "Logout",
        update: "Update Profile",
        upload: "Upload Photo",
        remove: "Remove",
        changePassword: "Change Password",
        changeAddress: "Change Address",
      },
      form: {
        labels: {
          firstName: "First Name",
          lastName: "Last Name",
          username: "Username",
          phone: "Phone Number",
          email: "Email",
          password: "Password",
        },
        hints: {
          firstName: "Use your legal name so it appears correctly on receipts and invoices.",
          username: "Shown publicly when you leave reviews or comments.",
          phone: "Keep this number active so couriers can reach you quickly.",
          email: "Transaction receipts will be sent to this e-mail address.",
          password: "Refresh your password periodically to keep the account secure.",
          address: "Accurate addresses speed up delivery and reduce failed shipments.",
        },
        address: {
          title: "Address",
          label: "Home - {name}",
          placeholderName: "Example User",
          description:
            "123 Main Street, Springfield. Use lorem ipsum placeholder until real data is wired.",
        },
        passwordPlaceholder: "********",
      },
    },
    admin: {
      header: {
        title: "Admin Profile",
        description:
          "Keep administrative contact details up to date to streamline internal coordination.",
        sectionTitle: "Admin Account",
        sectionDescription:
          "This information helps other admins reach you and audit system activities.",
      },
      sidebar: {
        title: "Menu",
        account: "Admin Data",
        orders: "Reports",
        ordersHint: "Report integration coming soon",
      },
      actions: {
        logout: "Logout",
        update: "Save Changes",
        upload: "Upload Avatar",
        remove: "Remove Avatar",
        changePassword: "Set Password",
        changeAddress: "Set Address",
      },
      form: {
        labels: {
          firstName: "First Name",
          lastName: "Last Name",
          username: "Admin Code",
          phone: "Office Number",
          email: "Admin Email",
          password: "Password",
        },
        hints: {
          firstName: "Match the name used in internal documentation.",
          username: "Admin code appears in audit logs for traceability.",
          phone: "Use an office line for smooth operational communication.",
          email: "System alerts and escalations are delivered to this inbox.",
          password: "Rotate the password regularly to protect admin access.",
          address: "Office addresses are used for document logistics.",
        },
        address: {
          title: "Office Address",
          label: "Head Office - {name}",
          placeholderName: "KenBike Admin",
          description:
            "Jl. Merdeka 123, Central Jakarta. KenBike HQ, 3rd floor.",
        },
        passwordPlaceholder: "********",
      },
    },
    owner: {
      header: {
        title: "Owner Profile",
        description:
          "Maintain owner-level details to stay connected with strategic and financial reports.",
        sectionTitle: "Owner Account",
        sectionDescription:
          "Used for corporate communications, partner relations, and performance dashboards.",
      },
      sidebar: {
        title: "Menu",
        account: "Owner Info",
        orders: "Business Summary",
        ordersHint: "Business dashboard launching soon",
      },
      actions: {
        logout: "Logout",
        update: "Save Profile",
        upload: "Upload Avatar",
        remove: "Remove Avatar",
        changePassword: "Manage Password",
        changeAddress: "Manage Address",
      },
      form: {
        labels: {
          firstName: "First Name",
          lastName: "Last Name",
          username: "Owner Code",
          phone: "Contact Number",
          email: "Business Email",
          password: "Password",
        },
        hints: {
          firstName: "Match the legal name used in corporate filings.",
          username: "Owner code links to executive reports and statements.",
          phone: "Consultants rely on this number for urgent updates.",
          email: "Business reports and analytics will be delivered here.",
          password: "Strong, regularly rotated passwords protect key assets.",
          address: "Business addresses support audits and correspondence.",
        },
        address: {
          title: "Business Address",
          label: "Operational Office - {name}",
          placeholderName: "KenBike Owner",
          description:
            "Jl. Kebon Sirih 45, Central Jakarta. Main operational base for KenBike.",
        },
        passwordPlaceholder: "********",
      },
    },
  },
};

const defaultProfiles: Record<RoleKey, ProfileSnapshot> = {
  user: {
    firstName: "Example",
    lastName: "User",
    username: "user1",
    phone: "081234567890",
    email: "user@gmail.com",
    address:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In scelerisque tempor nisl, et imperdiet est tristique vel. Pellentesque elit turpis, vulputate vel orci et, imperdiet mollis tortor.",
  },
  admin: {
    firstName: "Admin",
    lastName: "Account",
    username: "ADM-001",
    phone: "021-555-1234",
    email: "admin@kenbike.com",
    address: "Jl. Merdeka No. 123, Jakarta Pusat",
  },
  owner: {
    firstName: "Owner",
    lastName: "KenBike",
    username: "OWN-001",
    phone: "+62 811-2222-3333",
    email: "owner@kenbike.com",
    address: "Jl. Kebon Sirih No. 45, Jakarta Pusat",
  },
};

export default function ProfileScreen({ role }: { role: UserRole | null }) {
  const router = useRouter();
  const { language } = useLanguage();
  const normalizedRole: RoleKey = role ?? "user";
  const copy = dictionary[language][normalizedRole];
  const baseProfile = useMemo(() => defaultProfiles[normalizedRole], [normalizedRole]);
  const [profile, setProfile] = useState<ProfileSnapshot>(baseProfile);

  useEffect(() => {
    setProfile(baseProfile);
  }, [baseProfile]);

  useEffect(() => {
    try {
      const storedName = window.localStorage.getItem("name");
      if (storedName) {
        const parts = storedName.trim().split(/\s+/);
        const [firstName, ...rest] = parts;
        setProfile((current) => ({
          ...current,
          firstName: firstName || current.firstName,
          lastName: rest.join(" ") || current.lastName,
        }));
      }
    } catch (error) {
      console.error("Failed to read saved name", error);
    }
  }, [normalizedRole]);

  const fullName = useMemo(() => {
    const combined = [profile.firstName, profile.lastName].filter(Boolean).join(" ");
    return combined || copy.form.address.placeholderName;
  }, [profile.firstName, profile.lastName, copy.form.address.placeholderName]);

  const addressLabel = useMemo(() => {
    return copy.form.address.label.replace("{name}", fullName);
  }, [copy.form.address.label, fullName]);

  const handleLogout = () => {
    try {
      window.localStorage.setItem("token", "");
      window.localStorage.removeItem("role");
      window.localStorage.removeItem("name");
    } catch (error) {
      console.error("Failed to clear auth data", error);
    }
    router.push("/");
  };

  return (
    <div className="bg-gray-50 py-10">
      <div className="container mx-auto grid gap-8 md:grid-cols-[220px_1fr]">
        <aside className="bg-white rounded-lg border shadow-sm p-6 space-y-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              {copy.sidebar.title}
            </p>
          </div>
          <nav className="space-y-3">
            <button
              type="button"
              className="w-full rounded-md border border-gray-200 bg-primary/10 px-4 py-2 text-left text-sm font-semibold text-primary"
            >
              {copy.sidebar.account}
            </button>
            <div className="rounded-md border border-dashed border-gray-200 px-4 py-2 text-left">
              <p className="text-sm font-medium text-gray-500">
                {copy.sidebar.orders}
              </p>
              <p className="text-xs text-gray-400">{copy.sidebar.ordersHint}</p>
            </div>
          </nav>
        </aside>

        <section className="bg-white rounded-lg border shadow-sm p-8 space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {copy.header.title}
              </h1>
              <p className="text-sm text-gray-500 max-w-xl">
                {copy.header.description}
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              {copy.actions.logout}
            </Button>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">
                {copy.header.sectionTitle}
              </h2>
              <p className="text-sm text-gray-500">
                {copy.header.sectionDescription}
              </p>
            </div>

            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <Avatar className="h-20 w-20 text-lg">
                <AvatarImage alt={fullName} />
                <AvatarFallback>
                  {fullName
                    .split(" ")
                    .filter(Boolean)
                    .map((namePart) => namePart[0]?.toUpperCase())
                    .join("") || "CN"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline">{copy.actions.upload}</Button>
                <Button variant="ghost" className="text-red-500 hover:text-red-600">
                  {copy.actions.remove}
                </Button>
              </div>
            </div>

            <form className="space-y-8">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {copy.form.labels.firstName}
                  </label>
                  <Input value={profile.firstName} readOnly />
                  <p className="text-xs text-gray-400">
                    {copy.form.hints.firstName}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {copy.form.labels.lastName}
                  </label>
                  <Input value={profile.lastName} readOnly />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {copy.form.labels.username}
                  </label>
                  <Input value={profile.username} readOnly />
                  <p className="text-xs text-gray-400">
                    {copy.form.hints.username}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {copy.form.labels.phone}
                  </label>
                  <Input value={profile.phone} readOnly />
                  <p className="text-xs text-gray-400">
                    {copy.form.hints.phone}
                  </p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">
                    {copy.form.labels.email}
                  </label>
                  <Input value={profile.email} readOnly />
                  <p className="text-xs text-gray-400">
                    {copy.form.hints.email}
                  </p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">
                    {copy.form.labels.password}
                  </label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="password"
                      value={copy.form.passwordPlaceholder}
                      readOnly
                      className="max-w-xs"
                    />
                    <Button variant="link" type="button">
                      {copy.actions.changePassword}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-400">
                    {copy.form.hints.password}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {copy.form.address.title}
                  </h3>
                </div>
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-blue-900">
                      {addressLabel}
                    </span>
                    <p className="text-sm text-blue-900/80">{profile.address}</p>
                  </div>
                  <div className="flex flex-wrap justify-between gap-2 text-xs text-blue-900/70">
                    <span>{copy.form.hints.address}</span>
                    <button
                      type="button"
                      className="text-blue-600 font-medium hover:underline"
                    >
                      {copy.actions.changeAddress}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="button">{copy.actions.update}</Button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
