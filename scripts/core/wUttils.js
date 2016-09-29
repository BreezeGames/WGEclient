'use strict';

class Uttils {
    static debug(string) {
        if (IS_DEBUG) {
            console.log(string);
        }
    }
}

