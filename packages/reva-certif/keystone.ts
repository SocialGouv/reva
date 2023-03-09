import { config, list } from '@keystone-6/core';
import { allowAll } from '@keystone-6/core/access';
import { text, checkbox, integer, relationship } from '@keystone-6/core/fields';

export default config({
  db: {
    provider: 'postgresql',
    url: 'postgresql://reva:password@localhost:5444/reva-certif?schema=public',
  },
  lists: {
    rome: list({
      access: allowAll,
      fields: {
        code: text({ validation: { isRequired: true }, isIndexed: true }),
        label: text({ validation: { isRequired: true } }),
        slug: text({ validation: { isRequired: true } }),
        url: text({ validation: { isRequired: true } }),
        is_active: checkbox({defaultValue: true, label: "Is active"}),
        certifications: relationship({ref: 'certification.romes', many: true}),
      },
    }),
    certification: list({
      access: allowAll,
      fields: {
        label: text({ validation: { isRequired: true } }),
        acronym: text({ validation: { isRequired: true } }),
        level: integer({ validation: { isRequired: true } }),
        activities: text({ validation: { isRequired: false } }),
        activity_area: text({ validation: { isRequired: false } }),
        accessible_job_type: text({ validation: { isRequired: false } }),
        abilities: text({ validation: { isRequired: false } }),
        slug: text({ validation: { isRequired: true } }),
        summary: text({ validation: { isRequired: false } }),
        rncp_id: text({ validation: { isRequired: true }, label: "Code RNCP" }),
        romes: relationship({ref: 'rome.certifications', many: true, label: "ROME"}),
      },
      description: "Cerification"
    })
  }
});
