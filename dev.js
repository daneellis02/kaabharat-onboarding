import * as esbuild from "esbuild";

const ctx = await esbuild.context({
  entryPoints: ["index.tsx"],
  bundle: true,
  outfile: "bundle.js",
  loader: { ".tsx": "tsx", ".ts": "ts" },
});

await ctx.serve({
  servedir: ".",
  port: 3000,
});

console.log(`🚀 Kaabharat Onboarding running at: http://localhost:3000`);
