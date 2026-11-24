import { useRef, useState } from "react";

export default function useSubmissionGuard() {
  const submissionStarted = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const beginSubmission = () => {
    if (submissionStarted.current) return false;

    submissionStarted.current = true;
    setIsSubmitting(true);
    return true;
  };

  const releaseSubmission = () => {
    submissionStarted.current = false;
    setIsSubmitting(false);
  };

  return { isSubmitting, beginSubmission, releaseSubmission };
}
