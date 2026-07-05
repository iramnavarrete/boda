import { useState, useEffect } from "react";
import { FamilyQuote } from "@/types";
import { useInvitationStore } from "@/features/front/stores/invitationStore";
import { FamilyQuotesService } from "@/services/familyQuotesService";

export function useDashboardMessages() {
  const [messages, setMessages] = useState<FamilyQuote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const invitationData = useInvitationStore((state) => state.invitationData);

  useEffect(() => {
    let unsubscribe = () => {};
    if (invitationData) {
      unsubscribe = FamilyQuotesService.subscribeToQuoteMessages(
        invitationData.id,
        (allMessages: FamilyQuote[]) => {
          const top5Messages = allMessages.slice(0, 5);
          setMessages(top5Messages);
          setIsLoading(false);

          setCurrentIndex((prev) => {
            if (top5Messages.length === 0) return 0;
            return prev >= top5Messages.length ? 0 : prev;
          });
        },
        (error) => {
          console.error("Error cargando mensajes:", error);
          setIsLoading(false);
        },
      );
    }

    return () => unsubscribe();
  }, [invitationData]);

  const currentMessage = messages[currentIndex];

  const nextSlide = () => {
    if (messages.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }
  };

  const prevSlide = () => {
    if (messages.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + messages.length) % messages.length);
    }
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return {
    messages,
    currentMessage,
    isLoading,
    currentIndex,
    nextSlide,
    prevSlide,
    goToSlide,
  };
}
