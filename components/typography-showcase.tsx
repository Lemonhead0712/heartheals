import {
  DisplayLarge,
  DisplayMedium,
  DisplaySmall,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Paragraph,
  Lead,
  Large,
  Small,
  Muted,
  Quote,
  List,
  InlineLink,
} from "@/components/typography"

export function TypographyShowcase() {
  return (
    <div className="space-y-12 py-8">
      <section className="space-y-4">
        <Heading2>Display Typography</Heading2>
        <div className="space-y-6">
          <DisplayLarge>Display Large</DisplayLarge>
          <DisplayMedium>Display Medium</DisplayMedium>
          <DisplaySmall>Display Small</DisplaySmall>
        </div>
      </section>

      <section className="space-y-4">
        <Heading2>Headings</Heading2>
        <div className="space-y-4">
          <Heading1>Heading 1</Heading1>
          <Heading2>Heading 2</Heading2>
          <Heading3>Heading 3</Heading3>
          <Heading4>Heading 4</Heading4>
          <Heading5>Heading 5</Heading5>
          <Heading6>Heading 6</Heading6>
        </div>
      </section>

      <section className="space-y-4">
        <Heading2>Body Text</Heading2>
        <div className="space-y-4">
          <Lead>
            This is a lead paragraph. It stands out from regular paragraphs and is typically used for introductions or
            important information that should catch the reader's attention.
          </Lead>
          <Paragraph>
            This is a regular paragraph. Good typography is important for readability and user experience. The right
            font choice, size, line height, and spacing can make content more accessible and enjoyable to read.
          </Paragraph>
          <Paragraph>
            Typography plays a crucial role in establishing the tone and personality of a design. Serif fonts like
            Playfair Display often convey elegance, tradition, and sophistication, while sans-serif fonts like Inter
            project a more modern, clean, and straightforward image.
          </Paragraph>
          <Large>This is large text, useful for emphasizing important points.</Large>
          <Small>This is small text, often used for captions or supplementary information.</Small>
          <Muted>This is muted text, typically used for less important or secondary information.</Muted>
        </div>
      </section>

      <section className="space-y-4">
        <Heading2>Quotes and Lists</Heading2>
        <div className="space-y-4">
          <Quote>
            "Typography is what language looks like. Good typography is measured by how well it reinforces the meaning
            of the text, not by some abstract scale of merit."
          </Quote>
          <List>
            <li>First item in the list</li>
            <li>
              Second item with <InlineLink href="#">an inline link</InlineLink>
            </li>
            <li>Third item in the list</li>
            <li>Fourth item with some longer text to demonstrate how line wrapping works with the list items</li>
          </List>
        </div>
      </section>
    </div>
  )
}
