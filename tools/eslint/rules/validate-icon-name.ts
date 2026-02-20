import { type TSESLint, type TSESTree } from "@typescript-eslint/utils";

import { createRule, findBestMatch, getIconSet, type MessageIds, type Options } from "./utils";

export const rule = createRule<Options, MessageIds>({
  create: (context: Readonly<TSESLint.RuleContext<MessageIds, Options>>) => {
    const { componentName = "Icon", propName = "name" } = context.options[0] || {};

    const validateIcon = (iconString: string, node: TSESTree.Node): void => {
      if (!iconString.includes(":") || iconString.includes(" ")) {
        return;
      }

      const [prefix, name] = iconString.split(":");
      const iconSet = getIconSet(prefix);

      if (!iconSet) {
        context.report({
          data: { prefix },
          messageId: "collectionNotFound",
          node,
        });
        return;
      }

      const exists = Boolean(
        Object.prototype.hasOwnProperty.call(iconSet.icons, name) ||
        (iconSet.aliases && Object.prototype.hasOwnProperty.call(iconSet.aliases, name))
      );

      if (!exists) {
        const suggestion = findBestMatch(name, iconSet);

        context.report({
          data: { name, prefix },
          messageId: "iconNotFound",
          node,
          suggest: suggestion
            ? [
                {
                  data: { suggestion: `${prefix}:${suggestion}` },
                  fix: (fixer: TSESLint.RuleFixer): TSESLint.RuleFix =>
                    fixer.replaceText(node, `"${prefix}:${suggestion}"`),
                  messageId: "suggestIcon",
                },
              ]
            : [],
        });
      }
    };

    return {
      JSXOpeningElement: (node: TSESTree.JSXOpeningElement): void => {
        if (node.name.type !== "JSXIdentifier" || node.name.name !== componentName) {
          return;
        }

        const nameAttribute = node.attributes.find(
          (attr): attr is TSESTree.JSXAttribute =>
            attr.type === "JSXAttribute" &&
            attr.name.type === "JSXIdentifier" &&
            attr.name.name === propName
        );

        if (!nameAttribute || !nameAttribute.value) return;

        if (
          nameAttribute.value.type !== "Literal" ||
          typeof nameAttribute.value.value !== "string"
        ) {
          return;
        }

        validateIcon(nameAttribute.value.value, nameAttribute.value);
      },
      'Property[key.name="icon"] > Literal': (node: TSESTree.Literal): void => {
        if (typeof node.value === "string") {
          validateIcon(node.value, node);
        }
      },
    };
  },
  defaultOptions: [
    {
      componentName: "Icon",
      propName: "name",
    },
  ],
  meta: {
    docs: {
      description: "Validate Iconify icon names against installed JSON datasets",
    },
    hasSuggestions: true,
    messages: {
      collectionNotFound: 'Icon set "{{prefix}}" not found. Is it installed via @iconify/json?',
      iconNotFound: 'Icon "{{name}}" does not exist in the "{{prefix}}" collection.',
      missingPrefix: 'Icon string missing prefix (expected format "prefix:name").',
      suggestIcon: 'Did you mean "{{suggestion}}"?',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          componentName: { type: "string" },
          propName: { type: "string" },
        },
        type: "object",
      },
    ],
    type: "problem",
  },
  name: "validate-icon-name",
});
