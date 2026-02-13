import os
import re

def fix_button_usage(content):
    # Regex to find <Button ... as="a" ... > ... </Button>
    # or self closing <Button ... as="a" ... />

    # Logic:
    # 1. Component name must be Button
    # 2. Must have as="a" prop
    # 3. Must have href prop
    # 4. If self closing: convert to <Button asChild><a href="...">...</a></Button>
    #    But if it has children logic it's harder.
    #    Self closing <Button as="a" label="foo" /> -> <Button asChild><a href="...">foo</a></Button>

    # This is getting complex for regex. simpler approach:
    # Most usages are: <Button as="a" href="...">...</Button>
    # or <Button as="a" href="..." />

    # I'll handle the common pattern:
    # <Button as="a" ... > ... </Button>

    # 1. Remove as="a"
    # 2. Add asChild
    # 3. Wrap children in <a ...> ... </a>
    #    Where <a ...> takes all other props except variant, size, className?
    #    No, Button passes standard HTML attributes to the underlying element (Comp).
    #    So if we use asChild/Slot, the props passed to Button are passed to the child.
    #    Wait, Radix Slot merges props.
    #    So <Button asChild className="..." onClick="..."> <a href="...">Child</a> </Button>
    #    Button renders Slot. Slot renders its child (a) with merged props.
    #    So I just need to:
    #    Change <Button as="a" ...> to <Button asChild ...>
    #    AND ensure the child is an <a> tag.
    #    If the child is text, I need to wrap it in <a>.
    #    But if I do <Button asChild href="...">Text</Button>, Slot will try to render "Text" as the child and apply props to it? No, Slot expects a single element child.
    #    So I MUST wrap the content in <a>.

    #    Correction: If existing code is <Button as="a" href="/foo" class="bar">Text</Button>
    #    I should change it to:
    #    <Button asChild class="bar"> <a href="/foo">Text</a> </Button>
    #    Button handles variant/size classes and merges them with "bar".
    #    The 'href' prop passed to Button will be passed to Slot, which merges it to 'a'.
    #    So <Button asChild href="/foo"> <a ...>Text</a> </Button> should work!
    #    Wait, does Slot merge 'href'? Yes, it merges all props.
    #    So I just need to remove `as="a"` and add `asChild`, AND ensure there is a child element if it's not self-closing.
    #    BUT if it's just text inside, Slot will crash/fail because text node is not an element.
    #    So I MUST wrap text in <a>?
    #    Actually, if I pass `href` to Button, and use `asChild`, I need an element inside.
    #    The easiest fix is to change `as="a"` to `asChild`.
    #    AND wrap the children in `<a>`.
    #    BUT `href` is on Button.

    #    Use regex to catch `<Button[^>]*as="a"[^>]*>`

    def replacer(match):
        attrs = match.group(1)
        content = match.group(2)

        # remove as="a"
        attrs = attrs.replace('as="a"', 'asChild')

        # check if href is in attrs
        if 'href=' in attrs:
            # We need an <a> tag inside.
            # If content is just text or doesn't start with <a, wrap it.
            # Actually, even if it starts with <div, we need <a if we want it to be a link.
            # But wait, if I put <a href> inside, and Button also has href, it's redundant but harmless (Slot merges).
            # However, simpler:
            # <Button asChild ...> <a href="..."> ... </a> </Button>
            # Move `href` from Button to `a`.
            # Move `target` etc.
            # But rewriting props via regex is hard.

            # Alternative: Button component handles `as` prop manually if I modify Button.tsx.
            # "asChild" is the Right Way™ for Shadcn/Radix.
            # But "as" prop is much easier for migration.
            pass

        return f'<Button {attrs}>{content}</Button>'

    # Strategy B: Modify src/components/ui/button.tsx to support `as` prop.
    # This is much safer and less invasive than regex replacing usage across files.
    # I can just map `as` to `Comp`.
    return content

# I will use Strategy B. It is robust.
# The script here is a placeholder to say "I decided to modify the component instead".
pass
