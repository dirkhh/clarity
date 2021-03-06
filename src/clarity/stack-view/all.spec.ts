/**
 * This file is just my OCD coding in my place.
 *
 * The goal is to have the tests properly grouped in the reporter, instead of having them all
 * over the place because we load them asynchronously.
 *
 * We could also check here that we do export publicly all the directives needed to use Stack View,
 * but I don"t see a way to do it simply without it being completely irrelevant.
 */

import StackViewSpecs from "./stack-view.spec";
import StackHeaderSpecs from "./stack-header.spec";
import StackBlockSpecs from "./stack-block.spec";

describe("Stack View directives", () => {
    StackViewSpecs();
    StackHeaderSpecs();
    StackBlockSpecs();
});