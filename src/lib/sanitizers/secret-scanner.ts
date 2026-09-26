// src/lib/sanitizers/secret-scanner.ts

export interface DetectedSecret {
  type: string;
  matchedText: string;
  line: number;
  replacementVar: string;
}

const SECRET_PATTERNS = [
  {
    type: "Stripe Secret Key",
    regex: /sk_(live|test)_[0-9a-zA-Z]{24,}/g,
    varName: "STRIPE_SECRET_KEY",
  },
  {
    type: "Database Connection URI",
    regex: /postgres(?:ql)?:\/\/[^:\s]+:[^@\s]+@[^/\s]+\/[^\s]+/g,
    varName: "DATABASE_URL",
  },
  {
    type: "AWS Access Key",
    regex: /(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/g,
    varName: "AWS_ACCESS_KEY_ID",
  },
  {
    type: "JSON Web Token (JWT)",
    regex: /eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/g,
    varName: "AUTH_TOKEN",
  },
  {
    type: "Generic Private Key",
    regex: /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC )?PRIVATE KEY-----/g,
    varName: "PRIVATE_KEY",
  },
];

export function scanCodeForSecrets(content: string): DetectedSecret[] {
  if (!content) return [];
  const secrets: DetectedSecret[] = [];
  const lines = content.split("\n");

  lines.forEach((lineText, lineIdx) => {
    for (const pattern of SECRET_PATTERNS) {
      pattern.regex.lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = pattern.regex.exec(lineText)) !== null) {
        secrets.push({
          type: pattern.type,
          matchedText: match[0],
          line: lineIdx + 1,
          replacementVar: `process.env.${pattern.varName}`,
        });
      }
    }
  });

  return secrets;
}

export function maskSecrets(content: string, secrets: DetectedSecret[]): string {
  let masked = content;
  for (const s of secrets) {
    masked = masked.split(s.matchedText).join(s.replacementVar);
  }
  return masked;
}