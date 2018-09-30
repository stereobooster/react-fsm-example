jest.mock("src/api/fruitRequest", () => ({
  fruitRequest: jest.fn(() => "mockedFruitRequest")
}));
// require instead of import because of mock on top
const reducer = require("./reducers").default;

describe("testing reducer without need to touch side effects", () => {
  // sanity check
  it("unknown action", () => {
    expect(reducer({ test: 123 }, { type: "other" })).toEqual({ test: 123 });
  });
  it("deafult state", () => {
    expect(reducer(undefined, { type: "other" })).toEqual({ state: "initial" });
  });

  // actual tests
  describe("SUBMIT_FRUIT", () => {
    it("changes state to loading and creates side effect", () => {
      const [state, effect] = reducer(undefined, {
        type: "SUBMIT_FRUIT",
        form: "form"
      });
      expect(state).toEqual({ form: "form", state: "fruit_loading" });
      expect(effect.simulate({ success: true, result: "response" })).toEqual({
        resonse: "response",
        type: "SUBMIT_FRUIT_OK"
      });
      expect(effect.simulate({ success: false, result: "error" })).toEqual({
        error: "error",
        type: "SUBMIT_FRUIT_ERROR"
      });
    });

    it("ignores if there is effect already running", () => {
      const [state, effect] = reducer(
        { form: "form", state: "fruit_loading" },
        {
          type: "SUBMIT_FRUIT",
          form: "second form"
        }
      );
      expect(state).toEqual({ form: "form", state: "fruit_loading" });
    });
  });

  it("SUBMIT_FRUIT_ERROR", () => {
    const state = reducer(
      { form: "form", state: "fruit_loading" },
      { type: "SUBMIT_FRUIT_ERROR", error: "error" }
    );
    expect(state).toEqual({
      form: "form",
      error: "error",
      state: "fruit_error"
    });
  });

  it("SUBMIT_FRUIT_OK", () => {
    const state = reducer(
      { form: "form", state: "fruit_loading" },
      { type: "SUBMIT_FRUIT_OK", resonse: "resonse" }
    );
    expect(state).toEqual({
      form: "form",
      resonse: "resonse",
      state: "fruit_ok"
    });
  });
});

describe("testing reducer with side effects", () => {
  describe("SUBMIT_FRUIT", () => {
    // with mocked module
    it("checks that side effect calls fruitRequest", () => {
      const {fruitRequest} = require("src/api/fruitRequest");
      const [state, effect] = reducer(undefined, {
        type: "SUBMIT_FRUIT",
        form: { test: 123 }
      });
      expect(effect.func(...effect.args)).toEqual("mockedFruitRequest");
      expect(fruitRequest).toBeCalledWith({ test: 123 });
    });

    // with mocked fetch, this test is more appropriate for src/api/fruitRequest
    // describe("checks that side effect calls fetch", () => {
    //   let fetch;
    //   beforeEach(() => {
    //     fetch = global.fetch;
    //   });
    //   afterEach(() => {
    //     global.fetch = fetch;
    //   });
    //   it("creates side effect with network call", () => {
    //     // mocking fetch
    //     global.fetch = jest.fn().mockImplementation(() =>
    //       Promise.resolve({
    //         ok: true,
    //         json: () => [{ name: "test", price: 1, currency: "XYZ" }]
    //       })
    //     );
    //     // run test
    //     const [state, effect] = reducer(undefined, {
    //       type: "SUBMIT_FRUIT",
    //       form: { name: "", start: new Date() }
    //     });
    //     expect.assertions(1);
    //     return expect(effect.func(...effect.args)).resolves.toEqual([
    //       { currency: "XYZ", name: "test", price: 1 }
    //     ]);
    //   });
    // });
  });
});
