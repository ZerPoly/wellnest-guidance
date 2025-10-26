// data/assessments.ts
export interface AssessmentQuestion {
  id: number;
  question: string;
  type: 'likert' | 'multiple';
  options: {
    text: string;
    value: number;
  }[];
  category: 'depression' | 'anxiety' | 'stress' | 'wellness';
}

export interface Assessment {
  id: number;
  title: string;
  description: string;
  questions: AssessmentQuestion[];
}

// TEMPORARY: Hardcoded questions (will be replaced by backend)
export const mentalHealthAssessment: Assessment = {
  id: 1,
  title: "Understanding My Learning Mindset",
  description: "Understanding My Learning Mindset is a short self-reflection that helps you discover how you approach learning, stay motivated, and respond to challenges. It offers insight into your current mindset and growth as a student.",
  questions: [
    {
      id: 1,
      question: "When do you feel most motivated to learn something new?",
      type: "likert",
      options: [
        { text: "I rarely feel motivated because learning feels more like a burden than growth.", value: 0 },
        { text: "I get motivated only when grades or deadlines push me to.", value: 1 },
        { text: "I feel motivated when I understand the purpose behind what I’m learning.", value: 2 },
        { text: "I’m excited to learn when I see how it connects to my goals or passions.", value: 3 },
      ],
      category: "wellness",
    },
    {
      id: 2,
      question: "What helps you stay interested during your classes?",
      type: "likert",
      options: [
        { text: "Nothing really keeps my attention; I feel disconnected most of the time.", value: 0 },
        { text: "I stay focused only when the topic feels slightly relevant.", value: 1 },
        { text: "I stay interested when lessons are interactive or meaningful.", value: 2 },
        { text: "I’m fully engaged when I can apply lessons creatively or challenge myself.", value: 3 },
      ],
      category: "wellness",
    },
    {
      id: 3,
      question: "How do you feel when your teachers acknowledge your efforts?",
      type: "likert",
      options: [
        { text: "I feel surprised, like I don’t usually deserve it.", value: 0 },
        { text: "I appreciate it but still doubt if I’ve done enough.", value: 1 },
        { text: "I feel seen and encouraged to keep improving.", value: 2 },
        { text: "I feel proud and inspired to keep doing my best.", value: 3 },
      ],
      category: "wellness",
    },
    {
      id: 4,
      question: "What thoughts come up when your parents talk about your grades?",
      type: "likert",
      options: [
        { text: "I feel anxious and afraid of disappointing them.", value: 0 },
        { text: "I get defensive and stressed but still want to make them proud.", value: 1 },
        { text: "I listen and reflect on what I can do better.", value: 2 },
        { text: "I feel proud to share my progress and discuss ways to improve.", value: 3 },
      ],
      category: "wellness",
    },
    {
      id: 5,
      question: "How do you usually respond when school feels overwhelming?",
      type: "likert",
      options: [
        { text: "I shut down and avoid my tasks completely.", value: 0 },
        { text: "I push myself but end up feeling drained and frustrated.", value: 1 },
        { text: "I take short breaks and plan what to do next.", value: 2 },
        { text: "I stay focused and turn challenges into opportunities to grow.", value: 3 },
      ],
      category: "wellness",
    },
    {
      id: 6,
      question: "How do you handle it when a subject feels too difficult?",
      type: "likert",
      options: [
        { text: "I give up quickly because it feels impossible.", value: 0 },
        { text: "I keep trying but with a lot of stress and self-doubt.", value: 1 },
        { text: "I ask for help and take time to understand it step by step.", value: 2 },
        { text: "I see it as a challenge that can help me sharpen my skills.", value: 3 },
      ],
      category: "wellness",
    },
    {
      id: 7,
      question: "What helps you focus and finish your schoolwork?",
      type: "likert",
      options: [
        { text: "I struggle to start or lose focus easily.", value: 0 },
        { text: "I force myself to finish even when I’m exhausted.", value: 1 },
        { text: "I focus better when I set small goals and remove distractions.", value: 2 },
        { text: "I work best when I’m organized and genuinely interested in what I’m doing.", value: 3 },
      ],
      category: "wellness",
    },
    {
      id: 8,
      question: "When do you feel proud of your school performance?",
      type: "likert",
      options: [
        { text: "Rarely — I often feel like I could have done better.", value: 0 },
        { text: "When I finally complete something after struggling.", value: 1 },
        { text: "When I see real progress and effort paying off.", value: 2 },
        { text: "When I go beyond expectations and feel confident about my growth.", value: 3 },
      ],
      category: "wellness",
    },
    {
      id: 9,
      question: "How do you react when you receive a low grade?",
      type: "likert",
      options: [
        { text: "I feel worthless and lose motivation completely.", value: 0 },
        { text: "I get frustrated but try to move on.", value: 1 },
        { text: "I reflect on what went wrong and learn from it.", value: 2 },
        { text: "I see it as feedback that helps me improve next time.", value: 3 },
      ],
      category: "wellness",
    },
    {
      id: 10,
      question: "What do you imagine for your academic future?",
      type: "likert",
      options: [
        { text: "I can’t really see a clear path; it feels uncertain.", value: 0 },
        { text: "I hope to do better but still doubt myself.", value: 1 },
        { text: "I imagine myself improving steadily with hard work.", value: 2 },
        { text: "I see a bright future where I achieve my goals confidently.", value: 3 },
      ],
      category: "wellness",
    },
    {
      id: 11,
      question: "How do you feel when you think about your past school experiences?",
      type: "likert",
      options: [
        { text: "I feel regret and wish things had gone differently.", value: 0 },
        { text: "I remember both the struggles and small wins with mixed feelings.", value: 1 },
        { text: "I see how those experiences helped me grow.", value: 2 },
        { text: "I feel grateful for how far I’ve come and how much I’ve learned.", value: 3 },
      ],
      category: "wellness",
    },
    {
      id: 12,
      question: "What have you learned from teachers you didn’t get along with?",
      type: "likert",
      options: [
        { text: "I mostly remember the frustration, not the lessons.", value: 0 },
        { text: "I learned patience but still hold on to the tension.", value: 1 },
        { text: "I realized that understanding different teaching styles helps me adapt.", value: 2 },
        { text: "I learned resilience and how to stay respectful despite differences.", value: 3 },
      ],
      category: "wellness",
    },
    {
      id: 13,
      question: "How do you manage your time between different school subjects?",
      type: "likert",
      options: [
        { text: "I often lose track of time and end up cramming.", value: 0 },
        { text: "I try to plan, but I get easily overwhelmed.", value: 1 },
        { text: "I manage my time by prioritizing and taking breaks when needed.", value: 2 },
        { text: "I keep a steady schedule that balances study, rest, and creativity.", value: 3 },
      ],
      category: "wellness",
    },
    {
      id: 14,
      question: "How do you usually deal with teasing or judgment at school?",
      type: "likert",
      options: [
        { text: "I take it deeply to heart and isolate myself.", value: 0 },
        { text: "I try to ignore it, but it still hurts inside.", value: 1 },
        { text: "I remind myself that their opinions don’t define me.", value: 2 },
        { text: "I handle it calmly and focus on staying confident and kind.", value: 3 },
      ],
      category: "wellness",
    },
    {
      id: 15,
      question: "What makes physical education or sports feel enjoyable or uncomfortable for you?",
      type: "likert",
      options: [
        { text: "I feel anxious and out of place during physical activities.", value: 0 },
        { text: "I participate but worry about being judged or compared.", value: 1 },
        { text: "I enjoy it when I focus on having fun rather than being perfect.", value: 2 },
        { text: "I feel energized and confident when I’m active and moving.", value: 3 },
      ],
      category: "wellness",
    },
    {
      id: 16,
      question: "How do you feel about your body when participating in school activities?",
      type: "likert",
      options: [
        { text: "I feel insecure and want to hide myself.", value: 0 },
        { text: "I compare myself to others and feel unsure.", value: 1 },
        { text: "I feel fine when I focus on what my body can do.", value: 2 },
        { text: "I feel proud of my body’s strength and capability.", value: 3 },
      ],
      category: "wellness",
    },
    {
      id: 17,
      question: "What helps you overcome self-doubt in school?",
      type: "likert",
      options: [
        { text: "I often give in to my doubts and stop trying.", value: 0 },
        { text: "I push through, even when I don’t believe in myself.", value: 1 },
        { text: "I remind myself of past successes to stay confident.", value: 2 },
        { text: "I replace doubt with determination and self-trust.", value: 3 },
      ],
      category: "wellness",
    },
  ],
};

// TEMPORARY: Map of assessments (will be replaced by backend)
export const assessments: Record<number, Assessment> = {
  1: mentalHealthAssessment,
  // Add more when you create them
};