import React from 'react';
import ReactTestUtils, { act, Simulate } from 'react-dom/test-utils';
import { fireEvent, render } from '@testing-library/react';
import { getDOMNode } from '@test/testUtils';
import DropdownMenu from '../DropdownMenu';
import DropdownItem from '../DropdownItem';
import Dropdown from '../Dropdown';
import userEvent from '@testing-library/user-event';

describe('<Dropdown.Menu>', () => {
  it('Should render a vertical ARIA menubar when used alone', () => {
    const instance = getDOMNode(
      <DropdownMenu>
        <DropdownItem>1</DropdownItem>
        <DropdownItem>2</DropdownItem>
      </DropdownMenu>
    );
    assert.equal(instance.getAttribute('role'), 'menubar');
    assert.equal(instance.getAttribute('aria-orientation'), 'vertical');

    // legacy assertions
    assert.isTrue(/\bdropdown-menu\b/.test(instance.className));
    assert.equal(instance.children.length, 2);
  });

  it('Should render a submenu when used inside <Dropdown>', () => {
    const instance = getDOMNode(
      <Dropdown>
        <Dropdown.Menu title="Submenu" data-testid="submenu">
          <Dropdown.Item id="submenu-item">Submenu item</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );

    const button = instance.querySelector('[role="button"]');

    userEvent.click(button);

    const menuitem = instance.querySelector('[role="menuitem"]');

    expect(menuitem).not.to.be.null;
    expect(menuitem).to.have.attribute('aria-haspopup', 'menu');
  });

  it('Should render a submenu when used inside another <Dropdown.Menu>', () => {
    const instance = getDOMNode(
      <Dropdown.Menu>
        <Dropdown.Menu title="Submenu">
          <Dropdown.Item id="submenu-item">Submenu item</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Menu>
    );

    const menuitem = instance.querySelector('[role="menuitem"]');

    expect(menuitem).not.to.be.null;
    expect(menuitem).to.have.attribute('aria-haspopup', 'menu');
  });

  // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#menu
  describe('Keyboard interaction & Focus management', () => {
    function renderMenubar(ui, focusAfterRender = true) {
      const menubar = getDOMNode(ui);

      if (focusAfterRender) {
        ReactTestUtils.act(() => {
          ReactTestUtils.Simulate.focus(menubar);
        });
      }

      return menubar;
    }

    it('When a menubar receives focus, keyboard focus is placed on the first item.', () => {
      const menubar = renderMenubar(
        <DropdownMenu>
          <DropdownItem id="first-item">First item</DropdownItem>
        </DropdownMenu>
      );

      expect(menubar.getAttribute('aria-activedescendant')).to.equal('first-item');
    });

    it('Clicking a menuitem moves focus onto the menuitem.', () => {
      const menubar = renderMenubar(
        <DropdownMenu>
          <DropdownItem id="first-item">First item</DropdownItem>
          <DropdownItem id="second-item">Second item</DropdownItem>
        </DropdownMenu>,
        false
      );

      act(() => {
        fireEvent.mouseDown(menubar.querySelector('#second-item'));
      });

      expect(menubar.getAttribute('aria-activedescendant')).to.equal('second-item');
    });

    describe('Down Arrow', () => {
      it('Moves focus to the next item', () => {
        const menubar = renderMenubar(
          <DropdownMenu>
            <DropdownItem id="first-item">First item</DropdownItem>
            <DropdownItem id="second-item">Second item</DropdownItem>
          </DropdownMenu>
        );

        act(() => {
          Simulate.keyDown(menubar, { key: 'ArrowDown' });
        });

        expect(menubar.getAttribute('aria-activedescendant')).to.equal('second-item');
      });
    });

    describe('Up Arrow', () => {
      it('Moves focus to the previous item', () => {
        const menubar = renderMenubar(
          <DropdownMenu>
            <DropdownItem id="first-item">First item</DropdownItem>
            <DropdownItem id="second-item">Second item</DropdownItem>
          </DropdownMenu>
        );

        act(() => {
          Simulate.keyDown(menubar, { key: 'ArrowDown' });
        });

        act(() => {
          Simulate.keyDown(menubar, { key: 'ArrowUp' });
        });

        expect(menubar.getAttribute('aria-activedescendant')).to.equal('first-item');
      });
    });

    describe('End', () => {
      it('Moves focus to the last item', () => {
        const menubar = renderMenubar(
          <DropdownMenu>
            <DropdownItem id="first-item">First item</DropdownItem>
            <DropdownItem>Second item</DropdownItem>
            <DropdownItem id="last-item">Third item</DropdownItem>
          </DropdownMenu>
        );

        act(() => {
          Simulate.keyDown(menubar, { key: 'End' });
        });

        expect(menubar.getAttribute('aria-activedescendant')).to.equal('last-item');
      });
    });

    describe('Home', () => {
      it('Moves focus to the first item', () => {
        const menubar = renderMenubar(
          <DropdownMenu>
            <DropdownItem id="first-item">First item</DropdownItem>
            <DropdownItem>Second item</DropdownItem>
            <DropdownItem id="last-item">Third item</DropdownItem>
          </DropdownMenu>
        );

        act(() => {
          Simulate.keyDown(menubar, { key: 'End' });
        });

        act(() => {
          Simulate.keyDown(menubar, { key: 'Home' });
        });

        expect(menubar.getAttribute('aria-activedescendant')).to.equal('first-item');
      });
    });

    describe('Enter', () => {
      it('Activates the item with focus.', () => {
        const onSelectSpy = sinon.spy();
        const onSelectItemSpy = sinon.spy();

        const menubar = renderMenubar(
          <DropdownMenu onSelect={onSelectSpy}>
            <DropdownItem eventKey="active-item" onSelect={onSelectItemSpy}>
              First item
            </DropdownItem>
          </DropdownMenu>
        );

        act(() => {
          Simulate.keyDown(menubar, { key: 'Enter' });
        });

        expect(onSelectItemSpy).to.have.been.called;
        expect(onSelectSpy).to.have.been.calledWith('active-item');
      });
    });

    describe('Space', () => {
      it('Activates the item with focus.', () => {
        const onSelectSpy = sinon.spy();
        const onSelectItemSpy = sinon.spy();

        const menubar = renderMenubar(
          <DropdownMenu onSelect={onSelectSpy}>
            <DropdownItem eventKey="active-item" onSelect={onSelectItemSpy}>
              First item
            </DropdownItem>
          </DropdownMenu>
        );

        act(() => {
          Simulate.keyDown(menubar, { key: ' ' });
        });

        expect(onSelectItemSpy).to.have.been.called;
        expect(onSelectSpy).to.have.been.calledWith('active-item');
      });
    });
  });

  it('Should render a submenu when used inside <Dropdown>', () => {
    const instance = getDOMNode(
      <Dropdown>
        <DropdownItem>1</DropdownItem>
        <DropdownMenu>
          <DropdownItem>2</DropdownItem>
          <DropdownItem>3</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    );

    assert.isNotNull(instance.querySelector('.rs-dropdown-item-submenu'));
  });

  it('Should call Dropdown.Menu onSelect callback only once', () => {
    const onSelectSpy = sinon.spy();

    const { getByTestId } = render(
      <DropdownMenu onSelect={onSelectSpy}>
        <DropdownItem data-testid="item-1" eventKey={1}>
          1
        </DropdownItem>
        <DropdownItem eventKey={2}>2</DropdownItem>
        <DropdownItem eventKey={3}>3</DropdownItem>
      </DropdownMenu>
    );

    userEvent.click(getByTestId('item-1'));

    expect(onSelectSpy.callCount).to.be.eq(1);
  });

  it('Should highlight menu item when hover', () => {
    const { getByTestId } = render(
      <DropdownMenu>
        <DropdownItem data-testid="item-1">1</DropdownItem>
        <DropdownItem>2</DropdownItem>
        <DropdownItem>3</DropdownItem>
        <DropdownItem>4</DropdownItem>
      </DropdownMenu>
    );

    const menuItem = getByTestId('item-1');

    userEvent.hover(menuItem);

    expect(menuItem).to.have.class('rs-dropdown-item-focus');

    userEvent.unhover(menuItem);

    expect(menuItem).not.to.have.class('rs-dropdown-item-focus');
  });

  it('Should call onSelect callback with correct `eventKey`', () => {
    const onSelectSpy = sinon.spy();

    const instance = getDOMNode(
      <DropdownMenu onSelect={onSelectSpy} activeKey={1}>
        <DropdownItem eventKey={1}>1</DropdownItem>
        <DropdownItem eventKey={2}>2</DropdownItem>
        <DropdownItem eventKey={3}>3</DropdownItem>
      </DropdownMenu>
    );

    act(() => {
      Simulate.click(instance.querySelectorAll('[role^="menuitem"]')[2], {
        bubbles: true
      });
    });

    expect(onSelectSpy).to.have.been.called;
    expect(onSelectSpy).to.have.been.calledWith(3);
  });

  it('Should have a custom className', () => {
    const instance = getDOMNode(<DropdownMenu className="custom" />);
    assert.include(instance.className, 'custom');
  });

  it('Should have a custom style', () => {
    const fontSize = '12px';
    const instance = getDOMNode(<DropdownMenu style={{ fontSize }} />);
    assert.equal(instance.style.fontSize, fontSize);
  });

  it('Should have a custom className prefix', () => {
    const instance = getDOMNode(<DropdownMenu classPrefix="custom-prefix" />);
    assert.ok(instance.className.match(/\bcustom-prefix\b/));
  });
});
