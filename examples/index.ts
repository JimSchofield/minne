import MyComponent from './my-component';
import MyList from './list-component';
import MyNumberComponent from './my-number-component'
import TestingRef from './testing-ref';
// import AdultComponent from './child-test';
import AdultComponent from './child-test-2';
import TestShadowRootFalse from './shadow-root-false';

MyComponent.define('my-component');
MyList.define('my-list');
MyNumberComponent.define('my-number-component');
TestingRef.define('testing-ref');
AdultComponent.define("adult-component")
TestShadowRootFalse.define("test-shadow-root-false");
