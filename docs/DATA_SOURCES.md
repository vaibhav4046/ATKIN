# Proofline — Legal Data Sources & Rights Compliance Matrix

Proofline enforces an algorithmic **Rights Gate** across all legal authority sources. As an open-source, sovereign tool, Proofline respects data publisher terms, distinguishing between public browsing, local storage, vector embedding, computational analysis, and redistribution.

---

## 1. Registered Source Packs

| Source Pack | Jurisdiction | Publisher | Official URL | Primary Licence | Default Rights Gate Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UK Legislation** | England & Wales / UK | The National Archives | `legislation.gov.uk` | Open Government Licence (OGL) v3.0 | **Full Local Permitted** |
| **Find Case Law** | England & Wales / UK | The National Archives | `caselaw.nationalarchives.gov.uk` | Open Justice Licence (OJL) v2.0 | **Restricted Computational Gate** |
| **Civil Procedure Rules** | England & Wales | Ministry of Justice | `justice.gov.uk/courts/procedure-rules` | Crown Copyright / OGL v3.0 | **Full Local Permitted** |
| **CourtListener** | United States | Free Law Project 501(c)(3) | `courtlistener.com` | US Public Domain (17 U.S.C. § 105) | **Research Permitted** |
| **EUR-Lex** | European Union | Publications Office of the EU | `eur-lex.europa.eu` | Decision 2011/833/EU (Attribution) | **Full Local Permitted** |
| **India Code** | India | Ministry of Law and Justice | `indiacode.nic.in` | Open Government Data (OGD) India | **Full Local Permitted** |

---

## 2. Operation Rights Evaluation Matrix

| Source ID | Fetch | Store | Index | Embed | Redistribute | Train | Rationale |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| `src-uk-legislation` | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed | Licensed under OGL v3.0. Worldwide, royalty-free, perpetual reuse with attribution. |
| `src-uk-find-case-law` | ✅ Allowed | ✅ Allowed | ⚠️ Permission Required | ⚠️ Permission Required | ❌ Not Allowed | ❌ Not Allowed | Open Justice Licence v2.0 restricts bulk computational indexing, commercial redistribution, and AI model training without bespoke licence from TNA. |
| `src-uk-cpr` | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed | Crown Copyright managed under OGL v3.0. Essential procedural rules for civil justice. |
| `src-us-courtlistener` | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed | US federal court decisions are not subject to copyright. Free Law Project API terms respect rate limits. |
| `src-eu-eurlex` | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed | European Commission Decision 2011/833/EU authorises reuse subject to source acknowledgement and non-distortion. |
| `src-in-indiacode` | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed | National Data Sharing and Accessibility Policy (NDSAP) allows open research and non-commercial local indexing. |

---

## 3. The National Archives (Find Case Law) Boundary Detail

A critical distinction in UK legal informatics is that judgments published on `caselaw.nationalarchives.gov.uk` are governed by the **Open Justice Licence v2.0**, not the standard Open Government Licence.

Under Section 3 and Section 4 of the Open Justice Licence:
1. **Permitted**: Individuals may read, search, view, and quote judgments in legal proceedings or scholarly analysis.
2. **Restricted**: Automated harvesting, bulk vector embeddings, and computational text processing for AI training or commercial model distillation require explicit computational licences issued by The National Archives.

**How Proofline Enforces This**:
- Single judgment lookup and source link-out are permitted in `public_research` mode.
- Bulk indexing, vector embedding, and model training are blocked by `evaluateRights('src-uk-find-case-law', 'embed')`, which yields `requires_permission` and displays a compliance warning to the solicitor.

---

## 4. Ingestion Integrity & SHA-256 Pinning

Every document or statutory excerpt imported into Proofline is pinned with an immutable SHA-256 digest:
```
Digest = SHA-256(UTF8_ENCODE(document_content))
```
If an imported file is modified on disk or corrupted during sync, Proofline's dependency engine invalidates all dependent fact edges and displays an amber "Source Invalidation" alert on the workbench.
