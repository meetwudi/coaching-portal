/**
 * @fileoverview Rule to restrict direct imports of createServerComponentClient
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
        "Import createServerSupabaseClient from '@/lib/supabase-server' instead of directly importing createServerComponentClient",
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
            // Check if importing createServerComponentClient
            const hasCreateServerComponentClient = node.specifiers.some(
              (specifier) =>
                specifier.imported &&
                specifier.imported.name === "createServerComponentClient"
            );

            if (hasCreateServerComponentClient) {
              context.report({
                node,
                messageId: "directImport",
                fix(fixer) {
                  // Create a new import for createServerSupabaseClient
                  return fixer.replaceText(
                    node,
                    'import { createServerSupabaseClient } from "@/lib/supabase-server";'
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
