import * as tdi from '../src/tools';

describe('batchClass', () => {
  const TEST_SELECTOR = 'test-element';
  const TEST_CLASS = 'test-class';

  beforeEach(() => {
    const fragment = document.createDocumentFragment();
    const element = document.createElement('div');
    element.className = TEST_SELECTOR;
    for (let i = 0; i < 3; i++) {
      const div = document.createElement('div');
      element.appendChild(div);
    }
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

describe('getDataAttr', () => {
  const TEST_SELECTOR = 'test-element';

  beforeAll(() => {
    const fragment = document.createDocumentFragment();
    const element = document.createElement('div');
    element.className = TEST_SELECTOR;
    element.setAttribute('data-test', 'test-value');
    element.setAttribute('data-data-wrong', 'wrong-test-value');
    fragment.appendChild(element);
    document.body.appendChild(fragment);
  });

  it('Should return value of data attribute if exists', () => {
    const element = document.querySelector(`.${TEST_SELECTOR}`) as HTMLElement;
    expect(tdi.getDataAttr(element, 'test')).toBe('test-value');
  });
  it('Should return null if data attribute does not exist', () => {
    const element = document.querySelector(`.${TEST_SELECTOR}`) as HTMLElement;
    expect(tdi.getDataAttr(element, 'wrong')).toBeNull();
  });
  it('Should throw error if data attribute contains "data-"', () => {
    const element = document.querySelector(`.${TEST_SELECTOR}`) as HTMLElement;
    expect(() => tdi.getDataAttr(element, 'data-wrong')).toThrow();
  });
});
