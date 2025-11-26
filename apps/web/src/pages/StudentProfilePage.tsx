import { useMyProfile } from '../lib/me';

export const StudentProfilePage = () => {
  const { data: profile, isLoading, error } = useMyProfile();

  if (isLoading) {
    return (
      <section className="space-y-6">
        <header>
          <div className="nb-card--flat">
            <h1 className="text-2xl font-bold">Hồ sơ cá nhân</h1>
            <p className="mt-1 text-sm opacity-70">
              Thông tin cá nhân của bạn trong hệ thống.
            </p>
          </div>
        </header>
        <div className="nb-card">
          <p className="text-center py-8">Đang tải thông tin...</p>
        </div>
      </section>
    );
  }

  if (error) {
    const errorMessage =
      (error as any)?.response?.data?.message ||
      'Không thể tải thông tin hồ sơ';
    return (
      <section className="space-y-6">
        <header>
          <div className="nb-card--flat">
            <h1 className="text-2xl font-bold">Hồ sơ cá nhân</h1>
          </div>
        </header>
        <div className="nb-card bg-nb-coral/20 border-nb-coral">
          <p className="text-center py-8 text-nb-coral font-medium">
            {errorMessage}
          </p>
        </div>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="space-y-6">
        <header>
          <div className="nb-card--flat">
            <h1 className="text-2xl font-bold">Hồ sơ cá nhân</h1>
          </div>
        </header>
        <div className="nb-card">
          <p className="text-center py-8">Không tìm thấy thông tin hồ sơ.</p>
        </div>
      </section>
    );
  }


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <section className="space-y-6">
      <header>
        <div className="nb-card--flat">
          <h1 className="text-2xl font-bold">Hồ sơ cá nhân</h1>
          <p className="mt-1 text-sm opacity-70">
            Thông tin cá nhân của bạn trong hệ thống.
          </p>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info Card */}
        <div className="nb-card bg-nb-mint">
          <h2 className="text-lg font-bold mb-4 border-b-2 border-black pb-2 dark:border-nb-dark-border">
            Thông tin cơ bản
          </h2>
          <div className="space-y-3">
            <InfoRow label="MSSV" value={profile.mssv} />
            <InfoRow label="Họ và tên" value={profile.fullName} />
            <InfoRow label="Ngày sinh" value={formatDate(profile.dob)} />
            <InfoRow
              label="Lớp"
              value={
                profile.classId
                  ? `${profile.classId.code} - ${profile.classId.name}`
                  : 'Chưa phân lớp'
              }
            />
          </div>
        </div>

        {/* Contact Info Card */}
        <div className="nb-card bg-nb-sky">
          <h2 className="text-lg font-bold mb-4 border-b-2 border-black pb-2 dark:border-nb-dark-border">
            Thông tin liên hệ
          </h2>
          <div className="space-y-3">
            <InfoRow label="Email" value={profile.email} />
            <InfoRow label="Số điện thoại" value={profile.phone} />
            <InfoRow label="Địa chỉ" value={profile.address} />
          </div>
        </div>
      </div>
    </section>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
    <span className="font-semibold text-sm min-w-[120px]">{label}:</span>
    <span className="text-sm">{value}</span>
  </div>
);
