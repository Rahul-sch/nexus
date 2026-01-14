"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageSquare, Loader2, Send } from "lucide-react";

interface ClarificationFormProps {
  questions: string[];
  onSubmit: (answers: string[]) => Promise<void>;
  isSubmitting?: boolean;
}

export function ClarificationForm({
  questions,
  onSubmit,
  isSubmitting = false,
}: ClarificationFormProps) {
  const [answers, setAnswers] = useState<string[]>(
    new Array(questions.length).fill("")
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(answers);
  };

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const allAnswered = answers.every((a) => a.trim().length > 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-2 pb-4 border-b border-[var(--border)]">
        <MessageSquare className="h-5 w-5 text-[var(--primary)]" />
        <h3 className="text-lg font-medium text-[var(--foreground)]">
          Clarification Questions
        </h3>
      </div>

      <p className="text-sm text-[var(--foreground-secondary)]">
        The AI needs more information to refine your prompt effectively. Please
        answer the following questions:
      </p>

      <div className="space-y-6">
        {questions.map((question, index) => (
          <div key={index} className="space-y-2">
            <Label htmlFor={`answer-${index}`} className="text-sm font-medium">
              {index + 1}. {question}
            </Label>
            <Textarea
              id={`answer-${index}`}
              value={answers[index]}
              onChange={(e) => handleAnswerChange(index, e.target.value)}
              placeholder="Enter your answer..."
              disabled={isSubmitting}
              className="min-h-[80px]"
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={!allAnswered || isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Submit Answers
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
