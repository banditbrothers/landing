import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = [
  { ignores: [".next/**", "functions/**", "scripts/**", "backups/**", "next-env.d.ts"] },
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // New React Compiler advisory rule in eslint-config-next 16. Existing effects that sync state work fine;
      // kept visible as warnings rather than rewriting working components.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
];

export default eslintConfig;
