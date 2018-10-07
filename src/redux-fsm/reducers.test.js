jest.mock("src/api/fruitRequest", () => ({
  fruitRequest: jest.fn(() => "mockedFruitRequest")
}));
jest.mock("src/history", () => ({
  location: { pathname: "/" },
  push: jest.fn(() => {}),
  replace: jest.fn(() => {})
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
      expect(
        effect.simulate([{ success: true, result: "response" }, {}])
      ).toEqual([
        {
          resonse: "response",
          type: "SUBMIT_FRUIT_OK",
          form: "form"
        }
      ]);
      expect(
        effect.simulate([{ success: false, result: "error" }, {}])
      ).toEqual([
        {
          error: "error",
          type: "SUBMIT_FRUIT_ERROR",
          form: "form"
        }
      ]);
      expect(effect.cmds[0].args).toEqual(["form"]);
      expect(effect.cmds[1].args).toEqual(["/step-2"]);
    });

    it("updates form data of the current state, if there is effect already running", () => {
      const [state, effect] = reducer(
        { form: "form", state: "fruit_loading" },
        {
          type: "SUBMIT_FRUIT",
          form: "second form"
        }
      );
      expect(state).toEqual({ form: "second form", state: "fruit_loading" });
      expect(effect.type).toEqual("LIST");
      expect(effect.cmds[0].args).toEqual(["second form"]);
      expect(effect.cmds[1].args).toEqual(["/step-2"]);
    });
  });

  describe("SUBMIT_FRUIT_ERROR", () => {
    it("updates state and creates side effect", () => {
      const [state, effect] = reducer(
        { form: "form", state: "fruit_loading" },
        { type: "SUBMIT_FRUIT_ERROR", error: "error", form: "form" }
      );
      expect(state).toEqual({
        form: "form",
        error: "error",
        state: "fruit_error"
      });
      expect(effect.type).toEqual("RUN");
      expect(effect.simulate({ success: true })).toEqual(null);
      expect(effect.args).toEqual(["/step-2", "/"]);
    });

    it("does nothing in case of race condition", () => {
      const [state, effect] = reducer(
        { form: "second form", state: "fruit_loading" },
        { type: "SUBMIT_FRUIT_ERROR", error: "error", form: "form" }
      );
      expect(effect.type).toEqual("NONE");
    });
  });

  describe("SUBMIT_FRUIT_OK", () => {
    it("updates state and creates side effect", () => {
      const [state, effect] = reducer(
        { form: "form", state: "fruit_loading" },
        { type: "SUBMIT_FRUIT_OK", resonse: "resonse", form: "form" }
      );
      expect(state).toEqual({
        form: "form",
        resonse: "resonse",
        state: "fruit_ok"
      });
      expect(effect.type).toEqual("NONE");
    });

    it("does nothing in case of race condition", () => {
      const [state, effect] = reducer(
        { form: "second form", state: "fruit_loading" },
        { type: "SUBMIT_FRUIT_OK", resonse: "resonse", form: "form" }
      );
      expect(effect.type).toEqual("NONE");
    });
  });
});

describe("testing reducer with side effects", () => {
  describe("SUBMIT_FRUIT", () => {
    // with mocked modules
    it("checks that side effect calls fruitRequest", () => {
      const { fruitRequest } = require("src/api/fruitRequest");
      const [state, effects] = reducer(undefined, {
        type: "SUBMIT_FRUIT",
        form: { test: 123 }
      });
      const apiRequest = effects.cmds[0];
      expect(apiRequest.func(...apiRequest.args)).toEqual("mockedFruitRequest");
      expect(fruitRequest).toBeCalledWith({ test: 123 });
    });

    it("checks that side effect calls history", () => {
      const { push } = require("src/history");
      const [state, effects] = reducer(undefined, {
        type: "SUBMIT_FRUIT",
        form: { test: 123 }
      });

      const navigation = effects.cmds[1];
      expect(navigation.func(...navigation.args)).toEqual();
      expect(push).toBeCalledWith("/step-2");
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

  // with mocked modules
  describe("SUBMIT_FRUIT_ERROR", () => {
    const { replace, location } = require("src/history");
    beforeEach(() => {
      replace.mockClear();
      location.pathname = "/";
    });

    it("navigates back", () => {
      location.pathname = "/step-2";

      const [state, effect] = reducer(
        { form: "form", state: "fruit_loading" },
        { type: "SUBMIT_FRUIT_ERROR", error: "error", form: "form" }
      );
      expect(effect.func(...effect.args)).toEqual();
      expect(replace).toBeCalledWith("/");
    });

    it("does nothing if user navigated away", () => {
      const [state, effect] = reducer(
        { form: "form", state: "fruit_loading" },
        { type: "SUBMIT_FRUIT_ERROR", error: "error", form: "form" }
      );
      expect(effect.func(...effect.args)).toEqual();
      expect(replace).not.toBeCalled();
    });
  });
});
