/**
 * @fileoverview Rule to restrict direct imports of Supabase clients
 */

const supabaseImportRule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforces proper importing of Supabase client",
      category: "Best Practices",
      recommended: true,
    },
    fixable: "code",
    schema: [], // no options
    messages: {
      directImport:
        "Import createSupabaseServerClient from '@/lib/supabase-server' instead of directly importing from @supabase/ssr",
    },
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        // Only check imports from Supabase SSR package
        if (node.source.value === "@supabase/ssr") {
          const currentFilePath = context.getFilename();

          // Allow direct import only in supabase-server.ts
          if (!currentFilePath.endsWith("lib/supabase-server.ts")) {
            context.report({
              node,
              messageId: "directImport",
              fix(fixer) {
                return fixer.replaceText(
                  node,
                  'import { createSupabaseServerClient } from "@/lib/supabase-server";'
                );
              },
            });
          }
        }
      },
    };
  },
};

export default supabaseImportRule;
