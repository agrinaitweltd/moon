import { readFileSync, writeFileSync } from "fs";

const PATH = "lib/webflow/pages/eda4eb3e3530a7991e1e58c0e9b115dd35bc8547.json";
const data = JSON.parse(readFileSync(PATH, "utf8"));
const block = data.blocks[0];

const oldTag =
  '<form id="wf-form-General-Enquiry" name="wf-form-General-Enquiry" data-name="General Enquiry" method="post" class="contact_contact_form">';
const newTag =
  '<form id="wf-form-General-Enquiry" name="wf-form-General-Enquiry" data-name="General Enquiry" method="POST" action="https://formsubmit.co/hello@moonstone.co.ug" class="contact_contact_form">' +
  '<input type="hidden" name="_subject" value="New enquiry from moonstone.co.ug">' +
  '<input type="hidden" name="_captcha" value="false">' +
  '<input type="hidden" name="_template" value="table">';

if (!block.html.includes(oldTag)) {
  console.error("form open tag not found");
  process.exit(1);
}
block.html = block.html.replace(oldTag, newTag);

const out = `${JSON.stringify(data)}\n`;
JSON.parse(out);
writeFileSync(PATH, out);
console.log("wired contact form to FormSubmit.co -> hello@moonstone.co.ug");
