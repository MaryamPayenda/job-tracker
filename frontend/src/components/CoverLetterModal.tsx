import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { generateCoverLetter, getProfile } from "../api/jobs";
import jsPDF from "jspdf";

interface CoverLetterModalProps {
  job: {
    company: string;
    role: string;
  };
  onClose: () => void;
}

export default function CoverLetterModal({
  job,
  onClose,
}: CoverLetterModalProps) {
  const { token } = useAuth();
  const [jobDescription, setJobDescription] = useState("");
  const [language, setLanguage] = useState("English");
  const [coverLetter, setCoverLetter] = useState("");
  const [copied, setCopied] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: () => getProfile(token!),
  });

  const mutation = useMutation({
    mutationFn: () =>
      generateCoverLetter(token!, {
        company: job.company,
        role: job.role,
        job_description: jobDescription,
        language,
      }),
    onSuccess: (data) => {
      setCoverLetter(data.cover_letter);
    },
  });

  function handleCopy() {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString("en-GB");
    const fullName = profile?.full_name || "Applicant";
    const location = profile?.location || "";

    const marginLeft = 20;
    const marginRight = 190;
    const maxWidth = marginRight - marginLeft;
    const lineHeight = 7;
    const pageHeight = 275;

    // ─── HEADER ───────────────────────────────────────────
    doc.setFillColor(30, 30, 30);
    doc.rect(0, 0, 210, 55, "F");

    // Name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(fullName, 20, 18);

    // Location + date
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(200, 200, 200);
    if (location) doc.text(location, 20, 27);
    doc.text(today, 190, 27, { align: "right" });

    // Email + phone
    const emailText = profile?.email || "";
    const phoneText = profile?.phone || "";
    if (emailText) doc.text(emailText, 20, 35);
    if (phoneText) doc.text(phoneText, 190, 35, { align: "right" });

    // Clickable links
    const linkY = 46;
    const links: { label: string; url: string }[] = [];

    if (profile?.linkedin) {
      links.push({
        label: "LinkedIn",
        url: profile.linkedin.startsWith("http")
          ? profile.linkedin
          : `https://${profile.linkedin}`,
      });
    }

    if (profile?.github) {
      links.push({
        label: "GitHub",
        url: profile.github.startsWith("http")
          ? profile.github
          : `https://${profile.github}`,
      });
    }

    if (profile?.portfolio) {
      links.push({
        label: "Portfolio",
        url: profile.portfolio.startsWith("http")
          ? profile.portfolio
          : `https://${profile.portfolio}`,
      });
    }

    let linkX = 20;
    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      const labelWidth = doc.getTextWidth(link.label);

      // separator
      if (i > 0) {
        doc.setTextColor(200, 200, 200);
        doc.text("·", linkX, linkY);
        linkX += doc.getTextWidth("· ") + 1;
      }

      // clickable label
      doc.setTextColor(100, 180, 255);
      doc.text(link.label, linkX, linkY);
      doc.link(linkX, linkY - 4, labelWidth, 5, { url: link.url });

      linkX += labelWidth + 5;
    }

    // COMPANY BLOCK
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(job.company, marginLeft, 72);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Re: Application for ${job.role}`, marginLeft, 80);

    // Divider
    doc.setDrawColor(220, 220, 220);
    doc.line(marginLeft, 86, marginRight, 86);

    // SPLIT BODY AND CLOSING
    const closings = [
      "Mit freundlichen Grüßen",
      "Yours sincerely",
      "Kind regards",
      "Best regards",
      "Sincerely",
    ];

    let bodyText = coverLetter;
    let closingText = "";

    for (const closing of closings) {
      if (coverLetter.includes(closing)) {
        const parts = coverLetter.split(closing);
        bodyText = parts[0].trim();
        closingText = closing;
        break;
      }
    }

    // HELPER: CHECK NEW PAGE 
    function checkNewPage(y: number): number {
      if (y > pageHeight) {
        doc.addPage();
        return 20;
      }
      return y;
    }

    // BODY TEXT 
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    let currentY = 95;
    const paragraphs = bodyText
      .split("\n")
      .filter((p: string) => p.trim() !== "");

    for (const paragraph of paragraphs) {
      const lines = doc.splitTextToSize(paragraph, maxWidth);
      for (let i = 0; i < lines.length; i++) {
        currentY = checkNewPage(currentY);
        if (i < lines.length - 1) {
          doc.text(lines[i], marginLeft, currentY, {
            maxWidth,
            align: "justify",
          });
        } else {
          doc.text(lines[i], marginLeft, currentY);
        }
        currentY += lineHeight;
      }
      currentY += 5;
    }

    // CLOSING 
    if (closingText) {
      currentY += 10;
      currentY = checkNewPage(currentY);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(40, 40, 40);
      doc.text(closingText, marginLeft, currentY);

      // Signature line
      currentY += 22;
      currentY = checkNewPage(currentY);
      doc.setDrawColor(150, 150, 150);
      doc.line(marginLeft, currentY, marginLeft + 65, currentY);

      // Name under signature
      currentY += 6;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(40, 40, 40);
      doc.text(fullName, marginLeft, currentY);
    }

    // FOOTER ON ALL PAGES 
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFillColor(245, 245, 245);
      doc.rect(0, 282, 210, 15, "F");
      doc.setDrawColor(220, 220, 220);
      doc.line(0, 282, 210, 282);
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text(fullName, marginLeft, 290);
      doc.text(today, 190, 290, { align: "right" });
      doc.text(`Page ${i} of ${totalPages}`, 105, 290, { align: "center" });
    }

    doc.save(`cover-letter-${job.company}-${today}.pdf`);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Cover Letter Generator
              </h2>
              <p className="text-gray-400 text-sm mt-0.5">
                {job.role} at {job.company}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl font-medium"
            >
              ✕
            </button>
          </div>

          {/* Profile warning */}
          {profile && !profile.full_name && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-xl p-3 text-sm mb-4">
              ⚠️ Your profile is incomplete. Go to Profile settings to add your
              info for better cover letters.
            </div>
          )}

          {!coverLetter ? (
            <div className="flex flex-col gap-4">
              {/* Language selector */}
              <div className="flex gap-3">
                <button
                  onClick={() => setLanguage("English")}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                    language === "English"
                      ? "bg-gray-900 text-white border-gray-900"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage("German")}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                    language === "German"
                      ? "bg-gray-900 text-white border-gray-900"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  Deutsch
                </button>
              </div>

              <textarea
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={8}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50 resize-none"
              />

              {mutation.isError && (
                <p className="text-red-500 text-sm">
                  Failed to generate. Try again.
                </p>
              )}

              <button
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending || !jobDescription}
                className="w-full bg-gray-900 hover:bg-gray-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                {mutation.isPending ? "Generating..." : "Generate Cover Letter"}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="bg-gray-50 rounded-xl p-5 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap border border-gray-100">
                {coverLetter}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCopy}
                  className="flex-1 bg-gray-900 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
                >
                  {copied ? "Copied! ✓" : "Copy to Clipboard"}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex-1 border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold py-3 rounded-xl transition-colors text-sm"
                >
                  Download PDF
                </button>
              </div>

              <button
                onClick={() => setCoverLetter("")}
                className="text-gray-400 hover:text-gray-600 text-sm text-center"
              >
                ← Generate again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
