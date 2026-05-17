/**
 * MangaDex UUIDs that require a premium subscription.
 * All IDs were cross-referenced against mangadex.org via web search
 * during project setup (May 2026). Verify any additions at
 * https://api.mangadex.org/manga/<uuid> before deploying.
 */
export const PREMIUM_MANGA_IDS: ReadonlySet<string> = new Set([
  // ── Shonen / Action ──────────────────────────────────────────────────────
  'a1c7c817-4e59-43b7-9365-09675a149a6f', // One Piece
  '6b1eb93e-473a-4ab3-9922-1a66d2a29a4a', // Naruto
  '304ceac3-8cdb-4fe7-acf7-2b6ff7a60613', // Attack on Titan
  '789642f8-ca89-4e4e-8f7b-eee4d17ea08b', // Demon Slayer: Kimetsu no Yaiba
  '4f3bcae4-2d96-4c9d-932c-90181d9c873e', // My Hero Academia
  '239d6260-d71f-43b0-afff-074e3619e3de', // Bleach
  'db692d58-4b13-4174-ae8c-30c515c0689c', // Hunter x Hunter
  'c52b2ce3-7f95-469c-96b0-479524fb7a1a', // Jujutsu Kaisen
  'a77742b1-befd-49a4-bff5-1ad4e6b0ef7b', // Chainsaw Man (Part 1)
  '21cb54d0-290b-4ef4-ad75-e3e26bb8c841', // Chainsaw Man (Part 2)
  'e7eabe96-aa17-476f-b431-2497d5e9d060', // Black Clover
  '4141c5dc-c525-4df5-afd7-cc7d192a832f', // Blue Lock
  'e52d9403-3356-403b-b7bb-d7d6a420dd50', // The Seven Deadly Sins
  'dd8a907a-3850-4f95-ba03-ba201a8399e3', // Fullmetal Alchemist
  '75ee72ab-c6bf-4b87-badd-de839156934c', // Death Note
  '8946189d-682f-4838-9c2a-3c2dd5132f2c', // Akame ga Kill!
  '53ef1720-7a5d-40ad-90b0-2f9ca0a1ab01', // Soul Eater
  '8f8b7cb0-7109-46e8-b12c-0448a6453dfa', // Haikyu!!
  '319df2e2-e6a6-4e3a-a31c-68539c140a84', // Slam Dunk
  '754a46fa-62fa-457a-bc3b-4f31bf1373d4', // Rurouni Kenshin

  // ── Modern / Trending ────────────────────────────────────────────────────
  '6b958848-c885-4735-9201-12ee77abcb3c', // SPY×FAMILY
  '59b36734-f2d6-46d7-97c0-06cfd2380852', // Tokyo Revengers
  '296cbc31-af1a-4b5b-a34b-fee2b4cad542', // Oshi no Ko
  '46e9cae5-4407-4576-9b9e-4c517ae9298e', // The Promised Neverland
  '9bbb9e67-aaf7-4c24-a24e-942f036996dd', // Kaguya-sama: Love Is War
  '736a2bf0-f875-4b52-a7b4-e8c40505b68a', // Mob Psycho 100
  'd90ea6cb-7bc3-4d80-8af0-28557e6c4e17', // Dungeon Meshi (Delicious in Dungeon)

  // ── Seinen / Dark ────────────────────────────────────────────────────────
  '801513ba-a712-498c-8f57-cae55b38cc92', // Berserk
  '5d1fc77e-706a-4fc5-bea8-486c9be0145d', // Vinland Saga
  '6a1d1cb1-ecd5-40d9-89ff-9d88e40b136b', // Tokyo Ghoul
  'ac4e2459-d995-45ae-8421-4c4cf4a87770', // Overlord (manga)
  '07d858d0-1537-487f-8e1f-a32e1782206d', // Dororo

  // ── Sports ───────────────────────────────────────────────────────────────
  'd8a959f7-648e-4c8d-8f23-f1f3f8e129f3', // One-Punch Man

  // ── Fantasy / Isekai ────────────────────────────────────────────────────
  '37b87be0-b1f4-4507-affa-06c99ebb27f8', // Dragon Ball Super
  '22ea3f54-11e4-4932-a527-89d63d3a62d9', // Sword Art Online: Progressive
  '3dd0b814-23f4-4342-b75b-f206598534f6', // Sword Art Online: Aincrad
  '5ef4e73e-6fbc-456b-b7e1-4642256f666d', // Re:Zero (Chapter 1 Arc)
  '3ee952f1-45c7-4c39-aea2-7df7676606d4', // Blue Exorcist
  'e5ce88e2-8c46-482d-8acf-5c6d5a64a585', // Noragami
  '3bb0279f-a01d-4aa4-93e4-305800f4b83e', // Yona of the Dawn

  // ── Romance / Slice of Life ──────────────────────────────────────────────
  '7e2ddc4c-c07c-4163-bf48-2b7c45f7b7fb', // NANA
  '8bd19e5c-94f7-4368-a918-50f463857446', // Black Butler (Kuroshitsuji)

  // ── Classic / Timeless ───────────────────────────────────────────────────
  '52ede55c-1584-4019-b85b-3902a423c3ab', // Fairy Tail: 100 Years Quest
  '1e52d6ac-ae67-4966-bd22-07151a594ea6', // Fairy Tail Zero

  // ── Historical / Literary ────────────────────────────────────────────────
  'b7d069cb-4ab9-4c21-a20b-38f7c269be4e', // One-Punch Man (Original Webcomic)

  // ── Additional Mainstream ────────────────────────────────────────────────
  'f486a183-6660-492b-b94b-aa80960d8326', // Dragon Ball Super (Official Colored)
  'e896c48c-3150-437d-ba57-d8567eb399ae', // Chainsaw Man (Official Colored)
  '62040a44-0935-46b7-a691-5ae5833af0ae', // Demon Slayer (Official Colored)
  'f3ab48b2-e07c-4f21-b205-ceb0f4309451', // Re:Zero (Chapter 2 Arc)
  '8e67e13e-fdeb-44f5-8ecb-c4609df6b02c', // Re:Zero (Chapter 3: Truth of Zero)
])

export function isPremiumManga(mangaDexId: string): boolean {
  return PREMIUM_MANGA_IDS.has(mangaDexId)
}
