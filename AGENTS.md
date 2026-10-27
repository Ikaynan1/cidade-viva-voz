# Project rules

- Official electoral data is imported only by the `electoral-sync` edge function (TSE CKAN + CDN, IBGE Localidades); resource URLs are resolved via CKAN `package_show`, never hardcoded new endpoints — keeps sources verifiable.
- People (`politicians`) are never auto-merged across elections; official ids live in `politician_identifiers` (source + id_type + value) — prevents overwriting one person's history with another's.
- `candidacies` (result per election/round) and `mandates` (office actually held) are separate; mandates start as `nao_verificado` and only an institutional source/admin may set `em_exercicio` — an election result is not proof of current office.
- State/federal offices (governor, senators, deputies) attach to `uf` with `level` estadual/federal and `municipality_id` null — they are not city offices.
- Municipalities store `ibge_code` and `tse_code` separately — the two codes differ.
- Reference tables are public-read, admin-write (`has_role`); every import writes a `sync_logs` row and each record keeps `source_key`, `source_url`, `collected_at`.
