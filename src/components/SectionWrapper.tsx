export default function SectionWrapper({
  children,
  title,
  testAttribute,
}: {
  children: React.ReactNode;
  title: string;
  testAttribute: string;
}) {
  return (
    <div className='p-8 flex-1 min-h-[800px]' data-t={testAttribute}>
      <h2 className='text-2xl ml-4'>{title}</h2>
      <div className='mt-2'>{children}</div>
    </div>
  );
}
