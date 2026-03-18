import slugify from "slugify";

export function generateSlug(body: { slug?: string; name: string }) {
  body.slug = slugify(body.slug ? body.slug : body.name, {
    lower: true,
    strict: true,
    trim: true,
    remove: /[*+~.()"!:@]/g,
  });
  return body.slug;
}
