import { img, imgVector, imgIconLeft, imgIconLeft1 } from "./svg-y35h0";

function Group1() {
  return <img className="block max-w-none size-full" src={img} />;
}

function Icon() {
  return (
    <div className="basis-0 grow h-full min-h-px min-w-px relative shrink-0" data-name="Icon">
      <Group1 />
    </div>
  );
}

function IconButton() {
  return (
    <div className="content-stretch flex gap-1.5 items-center justify-center relative rounded-[8px] shrink-0 size-4" data-name="<Icon Button>">
      <Icon />
    </div>
  );
}

function Group3() {
  return <img className="block max-w-none size-full" src={img} />;
}

function Icon1() {
  return (
    <div className="basis-0 grow h-full min-h-px min-w-px relative shrink-0" data-name="Icon">
      <Group3 />
    </div>
  );
}

function IconButton1() {
  return (
    <div className="content-stretch flex gap-1.5 items-center justify-center relative rounded-[8px] size-4" data-name="<Icon Button>">
      <Icon1 />
    </div>
  );
}

function IconButtonGroupSmall() {
  return (
    <div className="content-stretch flex gap-1.5 items-start justify-start relative shrink-0" data-name="Icon Button Group Small">
      <IconButton />
      <div className="flex items-center justify-center relative shrink-0">
        <div className="flex-none rotate-[180deg] scale-y-[-100%]">
          <IconButton1 />
        </div>
      </div>
    </div>
  );
}

function UndoAndRedo() {
  return (
    <div className="box-border content-stretch flex gap-2 items-center justify-start px-0.5 py-0 relative shrink-0" data-name="Undo and Redo">
      <IconButtonGroupSmall />
    </div>
  );
}

function SeparatorVertical() {
  return (
    <div className="box-border content-stretch flex flex-col gap-2 h-6 items-center justify-center px-0 py-1 relative shrink-0 w-0.5" data-name="Separator/Vertical">
      <div className="basis-0 bg-[#eeeff1] grow min-h-px min-w-px rounded-[22px] shrink-0 w-px" data-name="Vector" />
    </div>
  );
}

function Group5() {
  return <img className="block max-w-none size-full" src={imgVector} />;
}

function IconLeft2() {
  return (
    <div className="relative shrink-0 size-4" data-name="Icon Left">
      <Group5 />
    </div>
  );
}

function IconButton4() {
  return (
    <div className="bg-[rgba(61,62,72,0)] h-6 relative rounded-[6px] shrink-0" data-name="Icon Button">
      <div className="box-border content-stretch flex gap-1 h-6 items-center justify-center overflow-clip p-[4px] relative">
        <IconLeft2 />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(61,62,72,0)] border-solid inset-0 pointer-events-none rounded-[6px]" />
    </div>
  );
}

function IconLeft3() {
  return (
    <div className="relative shrink-0 size-4" data-name="Icon Left">
      <img className="block max-w-none size-full" src={imgIconLeft} />
    </div>
  );
}

function IconButton5() {
  return (
    <div className="bg-[rgba(61,62,72,0)] h-6 relative rounded-[6px] shrink-0" data-name="Icon Button">
      <div className="box-border content-stretch flex gap-1 h-6 items-center justify-center overflow-clip p-[4px] relative">
        <IconLeft3 />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(61,62,72,0)] border-solid inset-0 pointer-events-none rounded-[6px]" />
    </div>
  );
}

function IconButtonGroupSmall2() {
  return (
    <div className="content-stretch flex gap-0.5 items-start justify-start relative shrink-0" data-name="Icon Button Group Small">
      <IconButton4 />
      <IconButton5 />
    </div>
  );
}

function Formating() {
  return (
    <div className="[grid-area:1_/_1] box-border content-stretch flex gap-1.5 items-start justify-center ml-0 mt-0 relative" data-name="Formating">
      <IconButtonGroupSmall2 />
    </div>
  );
}

function SeparatorVertical1() {
  return (
    <div className="[grid-area:1_/_1] box-border content-stretch flex flex-col gap-2 h-6 items-center justify-center ml-14 mt-0 px-0 py-1 relative w-0.5" data-name="Separator/Vertical">
      <div className="basis-0 bg-[#eeeff1] grow min-h-px min-w-px rounded-[22px] shrink-0 w-px" data-name="Vector" />
    </div>
  );
}

function MoreButtons() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-name="more buttons">
      <Formating />
      <SeparatorVertical1 />
    </div>
  );
}

function IconLeft4() {
  return (
    <div className="relative shrink-0 size-4" data-name="Icon Left">
      <img className="block max-w-none size-full" src={imgIconLeft1} />
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex gap-2.5 h-6 items-center justify-center relative shrink-0" data-name="Container">
      <IconLeft4 />
    </div>
  );
}

function Button() {
  return (
    <div className="bg-white h-6 relative rounded-[6px] shrink-0" data-name="<Button>">
      <div className="box-border content-stretch flex gap-1 h-6 items-center justify-center overflow-clip px-1.5 py-1 relative">
        <Container />
        <div className="font-['SF_Pro:Medium',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#42434d] text-[12px] text-nowrap">
          <p className="leading-[16px] whitespace-pre">Step</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#f4f4f6] border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(28,29,33,0.05)]" />
    </div>
  );
}

function AddStep() {
  return (
    <div className="content-stretch flex gap-1 items-center justify-start relative shrink-0" data-name="Add Step">
      <Button />
    </div>
  );
}

export default function FloatingActions() {
  return (
    <div className="bg-white relative rounded-[8px] size-full" data-name="Floating Actions">
      <div aria-hidden="true" className="absolute border border-[#eeeff1] border-solid inset-0 pointer-events-none rounded-[8px] shadow-[0px_2px_12px_0px_rgba(19,19,22,0.12),0px_0px_6px_0px_rgba(19,19,22,0.05)]" />
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex gap-1.5 items-center justify-start relative size-full p-[8px]">
          <UndoAndRedo />
          <SeparatorVertical />
          <MoreButtons />
          <AddStep />
        </div>
      </div>
    </div>
  );
}