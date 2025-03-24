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
      directComponentImport:
        "Import createServerSupabaseClient from '@/lib/supabase-server' instead of directly importing createServerComponentClient",
      directRouteImport:
        "Import createApiSupabaseClient from '@/lib/supabase-server' instead of directly importing createRouteHandlerClient",
      directActionImport:
        "Import createActionSupabaseClient from '@/lib/supabase-server' instead of directly importing createServerActionClient",
    },
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        // Only check imports from Supabase auth helpers
        if (node.source.value === "@supabase/auth-helpers-nextjs") {
          const currentFilePath = context.getFilename();

          // Allow direct import only in supabase-server.ts
          if (!currentFilePath.endsWith("lib/supabase-server.ts")) {
            // Check which Supabase client is being imported
            const importedSpecifiers = node.specifiers
              .filter((s) => s.imported)
              .map((s) => s.imported.name);

            if (importedSpecifiers.includes("createServerComponentClient")) {
              context.report({
                node,
                messageId: "directComponentImport",
                fix(fixer) {
                  return fixer.replaceText(
                    node,
                    'import { createServerSupabaseClient } from "@/lib/supabase-server";'
                  );
                },
              });
            }

            if (importedSpecifiers.includes("createRouteHandlerClient")) {
              context.report({
                node,
                messageId: "directRouteImport",
                fix(fixer) {
                  return fixer.replaceText(
                    node,
                    'import { createApiSupabaseClient } from "@/lib/supabase-server";'
                  );
                },
              });
            }

            if (importedSpecifiers.includes("createServerActionClient")) {
              context.report({
                node,
                messageId: "directActionImport",
                fix(fixer) {
                  return fixer.replaceText(
                    node,
                    'import { createActionSupabaseClient } from "@/lib/supabase-server";'
                  );
                },
              });
            }
          }
        }
      },
    };
  },
};

export default supabaseImportRule;
