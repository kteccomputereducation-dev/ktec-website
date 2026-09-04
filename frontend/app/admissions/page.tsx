import SectionHeading from "@/components/SectionHeading";
import EnquiryForm from "@/components/EnquiryForm";

export default function AdmissionsPage() {
  return (
    <div>
      <section className="border-b border-blueprint/10 bg-white">
        <div className="mx-auto max-w-5xl px-5 lg:px-8 py-16">
          <SectionHeading
            eyebrow="Admissions"
            title="Start your admission enquiry"
            description="Fill in your details and our team will get back to you with course, batch and fee information."
          />
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 lg:px-8 py-14">
        <EnquiryForm />
      </section>
    </div>
  );
}
