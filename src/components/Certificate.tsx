import React from 'react';
import { StudentData, User } from '../types';
import { LOGO_DATA_URI, getCertificateDuaText } from '../dataStore';

interface CertificateProps {
  user: User;
  studentData: StudentData;
}

export const Certificate: React.FC<CertificateProps> = ({ user, studentData }) => {
  const formatDateWithDay = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const printCertificate = (idx: number) => {
    const cert = studentData.certificates?.[idx];
    if (!cert) return;

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Certificate of Achievement — ${user.name}</title>
  <style>
    @page { size: A4 landscape; margin: 0; }
    body {
      margin: 0;
      padding: 40px;
      font-family: 'Segoe UI', Arial, sans-serif;
      background: #fdf8ec;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      box-sizing: border-box;
    }
    .certificate-card {
      position: relative;
      text-align: center;
      padding: 50px 60px;
      width: 100%;
      max-width: 800px;
      border-radius: 14px;
      box-sizing: border-box;
      background: #fdf8ec;
      border: 3px double #c9a227;
      box-shadow: 0 16px 40px rgba(45,71,57,0.16);
    }
    .cert-logo { width: 64px; height: auto; margin: 0 auto 20px; display: block; }
    .cert-title {
      font-family: Georgia, serif;
      font-size: 26px;
      color: #8a6d1f;
      margin: 0 0 20px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      font-weight: 600;
    }
    .cert-sub { font-size: 14px; color: #8a7a55; margin: 6px 0; letter-spacing: 0.5px; }
    .cert-student-name {
      font-family: Georgia, serif;
      font-size: 42px;
      color: #2d4739;
      font-weight: 700;
      margin: 15px 0;
      line-height: 1.2;
    }
    .cert-achievement { font-size: 20px; color: #3c5c4a; font-weight: 600; margin-bottom: 20px; }
    .cert-dua { font-size: 13px; color: #7a6a45; line-height: 1.8; max-width: 520px; margin: 0 auto 25px; font-style: italic; }
    .cert-divider { display: flex; align-items: center; justify-content: center; gap: 10px; margin: 20px auto; color: #c9a227; font-size: 12px; }
    .cert-divider::before, .cert-divider::after { content: ''; height: 1px; width: 100px; background: #c9a227; opacity: 0.6; }
    .cert-footer { display: flex; justify-content: space-around; gap: 16px; text-align: center; margin-top: 15px; }
    .cert-footer-col { flex: 1; }
    .cert-footer-label { font-size: 10.5px; color: #8a7645; text-transform: uppercase; letter-spacing: 1.2px; }
    .cert-footer-value { font-size: 14px; color: #3c3020; font-weight: 600; margin-top: 4px; }
    .cert-signature { font-family: 'Brush Script MT', 'Segoe Script', cursive; font-size: 26px; color: #2d4739; font-weight: 700; margin-top: 2px; }
  </style>
</head>
<body>
  <div class="certificate-card">
    <img src="${LOGO_DATA_URI}" alt="Learn with Sofiya logo" class="cert-logo">
    <h2 class="cert-title">Certificate of Achievement</h2>
    <p class="cert-sub">This certificate is proudly presented to</p>
    <p class="cert-student-name">${user.name}</p>
    <p class="cert-achievement">${cert.title}</p>
    <p class="cert-dua">${cert.duaText || getCertificateDuaText()}</p>
    <div class="cert-divider">✦</div>
    <div class="cert-footer">
      <div class="cert-footer-col">
        <div class="cert-footer-label">Issued On</div>
        <div class="cert-footer-value">${formatDateWithDay(cert.date)}</div>
      </div>
      <div class="cert-footer-col">
        <div class="cert-footer-label">Instructor</div>
        <div class="cert-footer-value">${cert.instructor || 'Sofiya'}</div>
      </div>
      <div class="cert-footer-col">
        <div class="cert-footer-label">Signature</div>
        <div class="cert-signature">${cert.signature || 'Ustadha Sofiya'}</div>
      </div>
    </div>
  </div>
</body>
</html>`;

    const win = window.open('', '_blank');
    if (!win) {
      alert('Please allow pop-ups to print this certificate.');
      return;
    }
    win.document.write(html);
    win.document.close();
    win.onload = function () {
      win.print();
    };
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#24392c] p-6 rounded-2xl shadow-sm border border-border-soft dark:border-[#4a6552]">
        <h2 className="text-lg font-bold font-serif text-sage-dark dark:text-white">🏅 Certificates &amp; Milestones</h2>
        <p className="text-xs text-muted dark:text-[#C7D2C4] mb-4">Official tokens of completion awarded by Ustadha Sofiya.</p>

        <div className="space-y-6">
          {(studentData.certificates || []).length === 0 ? (
            <p className="text-xs text-muted dark:text-[#C7D2C4] text-center py-6">No certificates awarded yet. Keep up the excellent work! 🌱</p>
          ) : (
            (studentData.certificates || []).map((cert, idx) => (
              <div key={idx} className="border border-border-soft dark:border-[#4a6552] rounded-2xl overflow-hidden shadow-sm">
                {/* On-Page Certificate Preview */}
                <div className="p-8 bg-[#fdf8ec] text-center text-[#2d4739] relative border-b border-dashed border-gold/40">
                  <img src={LOGO_DATA_URI} alt="Learn with Sofiya logo" className="w-14 h-auto mx-auto mb-4" />
                  <h3 className="font-serif text-base uppercase tracking-wider text-[#8a6d1f] mb-4 font-semibold">Certificate of Achievement</h3>
                  <p className="text-xs text-[#8a7a55] mb-1">This certificate is proudly presented to</p>
                  <p className="font-serif text-2xl font-bold mb-3">{user.name}</p>
                  <p className="text-[#3c5c4a] font-semibold text-sm mb-4">{cert.title}</p>
                  <p className="text-xs italic text-[#7a6a45] leading-relaxed max-w-md mx-auto mb-6">
                    {cert.duaText || getCertificateDuaText()}
                  </p>
                  
                  <div className="flex items-center justify-center gap-2 text-gold text-xs mb-4">
                    <span className="w-10 h-[1px] bg-gold opacity-60"></span>
                    <span>✦</span>
                    <span className="w-10 h-[1px] bg-gold opacity-60"></span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider text-[#8a7645]">Issued On</span>
                      <span className="font-semibold">{formatDateWithDay(cert.date)}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider text-[#8a7645]">Instructor</span>
                      <span className="font-semibold">{cert.instructor || 'Sofiya'}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider text-[#8a7645]">Signature</span>
                      <span className="font-serif italic font-bold text-[#2d4739] text-sm">{cert.signature || 'Ustadha Sofiya'}</span>
                    </div>
                  </div>
                </div>

                {/* Actions row */}
                <div className="p-3 bg-white dark:bg-[#24392c] flex justify-end gap-2">
                  <button
                    onClick={() => printCertificate(idx)}
                    className="px-4 py-1.5 bg-sage hover:bg-sage-dark text-white rounded-lg text-xs font-bold transition-all"
                  >
                    🖨️ Print Certificate
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
