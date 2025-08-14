import * as tdi from '../src/tools';

const TEST_SELECTOR = 'test-element';
const TEST_CLASS = 'test-class';

describe('batchClass', () => {
  beforeEach(() => {
    const fragment = document.createDocumentFragment();
    const element = document.createElement('div');
    element.className = TEST_SELECTOR;
    const div1 = document.createElement('div');
    const div2 = document.createElement('div');
    const div3 = document.createElement('div');
    element.appendChild(div1);
    element.appendChild(div2);
    element.appendChild(div3);
    fragment.appendChild(element);
    document.body.appendChild(fragment);
  });

  afterEach(() => {
    // Clean up DOM
    document.body.innerHTML = '';
  });

  it('Should add class to one or a list of elements', () => {
    const elements = document.querySelectorAll(
      `.${TEST_SELECTOR} > div`
    ) as NodeListOf<HTMLElement>;

    tdi.batchClass(elements, 'add', TEST_CLASS);
    expect(elements[0].classList.contains(TEST_CLASS)).toBe(true);
    expect(elements[1].classList.contains(TEST_CLASS)).toBe(true);
    expect(elements[2].classList.contains(TEST_CLASS)).toBe(true);
  });
  it('Should remove class from one or a list of elements', () => {
    const elements = document.querySelectorAll(
      `.${TEST_SELECTOR} > div`
    ) as NodeListOf<HTMLElement>;
    elements.forEach(el => el.classList.add(TEST_CLASS));

    tdi.batchClass(elements, 'remove', TEST_CLASS);

    expect(elements[0].classList.contains(TEST_CLASS)).toBe(false);
    expect(elements[1].classList.contains(TEST_CLASS)).toBe(false);
    expect(elements[2].classList.contains(TEST_CLASS)).toBe(false);
  });
});
