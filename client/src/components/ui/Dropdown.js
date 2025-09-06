import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

const Dropdown = ({
  trigger,
  items,
  align = 'right',
  width = 'w-48',
  className = ''
}) => {
  const alignmentStyles = {
    left: 'left-0 origin-top-left',
    right: 'right-0 origin-top-right'
  };

  return (
    <Menu as="div" className={`relative inline-block text-left ${className}`}>
      {({ open }) => (
        <>
          <Menu.Button as={Fragment}>
            {typeof trigger === 'function' ? trigger({ open }) : trigger}
          </Menu.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items
              className={`absolute z-50 mt-2 ${width} rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${alignmentStyles[align]}`}
            >
              <div className="py-1">
                {items.map((item, index) => {
                  if (item.type === 'divider') {
                    return <div key={index} className="my-1 border-t border-gray-100" />;
                  }

                  return (
                    <Menu.Item key={index}>
                      {({ active }) => {
                        const Component = item.as || 'button';
                        return (
                          <Component
                            {...(Component === 'button' ? { type: 'button' } : {})}
                            className={`
                              ${active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'}
                              group flex w-full items-center px-4 py-2 text-sm
                              ${item.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                              ${item.className || ''}
                            `}
                            onClick={item.onClick}
                            disabled={item.disabled}
                          >
                            {item.icon && (
                              <item.icon
                                className={`mr-3 h-5 w-5 ${active ? 'text-gray-500' : 'text-gray-400'}`}
                                aria-hidden="true"
                              />
                            )}
                            {item.label}
                          </Component>
                        );
                      }}
                    </Menu.Item>
                  );
                })}
              </div>
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );
};

export const DropdownButton = ({ children, className = '', ...props }) => (
  <button
    type="button"
    className={`
      inline-flex justify-center items-center rounded-lg border border-gray-300 
      bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm 
      hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-rose-500 
      focus:ring-offset-2 focus:ring-offset-gray-100
      ${className}
    `}
    {...props}
  >
    {children}
    <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
  </button>
);

export default Dropdown;