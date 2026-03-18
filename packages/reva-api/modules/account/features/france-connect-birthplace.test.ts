import { resolveBirthplaceFromInseeCode } from "./france-connect-birthplace";

vi.stubGlobal("fetch", vi.fn());

const mockFetch = fetch as ReturnType<typeof vi.fn>;

describe("resolveBirthplaceFromInseeCode", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("devrait résoudre Paris à partir du code INSEE 75056", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ nom: "Paris", codeDepartement: "75" }),
    });

    const result = await resolveBirthplaceFromInseeCode("75056");

    expect(result).toEqual({ cityName: "Paris", departmentCode: "75" });
    expect(mockFetch).toHaveBeenCalledWith(
      "https://geo.api.gouv.fr/communes/75056?fields=nom,codeDepartement",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it("devrait résoudre Ajaccio à partir du code INSEE corse 2A004", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ nom: "Ajaccio", codeDepartement: "2A" }),
    });

    const result = await resolveBirthplaceFromInseeCode("2A004");

    expect(result).toEqual({ cityName: "Ajaccio", departmentCode: "2A" });
    expect(mockFetch).toHaveBeenCalledWith(
      "https://geo.api.gouv.fr/communes/2A004?fields=nom,codeDepartement",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it("devrait résoudre Pointe-à-Pitre à partir du code INSEE DOM-TOM 97105", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ nom: "Pointe-à-Pitre", codeDepartement: "971" }),
    });

    const result = await resolveBirthplaceFromInseeCode("97105");

    expect(result).toEqual({
      cityName: "Pointe-à-Pitre",
      departmentCode: "971",
    });
    expect(mockFetch).toHaveBeenCalledWith(
      "https://geo.api.gouv.fr/communes/97105?fields=nom,codeDepartement",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it("devrait retourner null quand l'API retourne 404 pour un code INSEE inconnu", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const result = await resolveBirthplaceFromInseeCode("99999");

    expect(result).toBeNull();
  });

  it("devrait retourner null quand l'API retourne 500", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const result = await resolveBirthplaceFromInseeCode("75056");

    expect(result).toBeNull();
  });

  it("devrait retourner null quand la réponse de l'API ne contient pas les champs requis", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ nom: "Paris" }),
    });

    const result = await resolveBirthplaceFromInseeCode("75056");

    expect(result).toBeNull();
  });

  it("devrait retourner null en cas d'erreur réseau", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const result = await resolveBirthplaceFromInseeCode("75056");

    expect(result).toBeNull();
  });

  it("devrait retourner null en cas de timeout (AbortError)", async () => {
    const abortError = new DOMException(
      "The operation was aborted",
      "AbortError",
    );
    mockFetch.mockRejectedValueOnce(abortError);

    const result = await resolveBirthplaceFromInseeCode("75056");

    expect(result).toBeNull();
  });
});
