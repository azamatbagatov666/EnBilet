type Props = {
  className?: string;
};

export default function Drag2Svg({ className = "" }: Props) {
  return (
           <svg className={`${className || 'min-w-8! fill-black dark:fill-white'}`} viewBox="0 0 512 512">
            <path d="M64,384H448V341.33H64Zm0-106.67H448V234.67H64ZM64,128v42.67H448V128Z" />
          </svg>
  );
}
