import { type Dispatch, type MouseEventHandler, type RefObject, type SetStateAction, useEffect, useRef } from 'react';

const MARGIN = 20; // minimum margin from window edge in px

const getWindowDimensions = () => ({
	height: window.innerHeight ?? document.documentElement.clientHeight ?? document.body.clientHeight,
	width: window.innerWidth ?? document.documentElement.clientWidth ?? document.body.clientWidth,
});

type UseDraggableParams = {
	ref: RefObject<HTMLDivElement | null>;
	setPos: Dispatch<SetStateAction<[number, number]>>;
};

type DragState = {
	active: boolean;
	dragY0: number;
	dragX0: number;
	top0: number;
	left0: number;
};
const initialDragState: DragState = { active: false, dragY0: 0, dragX0: 0, top0: 0, left0: 0 };

export const useDraggable = ({ ref, setPos }: UseDraggableParams) => {
	const ds = useRef<DragState>(initialDragState);

	// On mouse down, start dragging
	const handleDragStart: MouseEventHandler<HTMLDivElement> = (e) => {
		if (ref.current === null) return;
		const rect = ref.current.getBoundingClientRect();
		e.preventDefault();
		const dsc = ds.current;
		dsc.active = true;
		// Save initial coords of the mouse as well as the window
		[dsc.dragY0, dsc.dragX0] = [e.clientY, e.clientX];
		[dsc.top0, dsc.left0] = [rect.top, rect.left];
	};

	// Ensure the window stays within the viewport limits
	const applyLimits = ([top, left]: [number, number]): [number, number] => {
		if (ref.current === null) return [top, left];
		const rect = ref.current.getBoundingClientRect();
		const dims = getWindowDimensions();
		const maxTop = dims.height - rect.height - MARGIN;
		const maxLeft = dims.width - rect.width - MARGIN;
		// First apply bottom-right, so for a tiny window, top-left gets precedence
		top > maxTop && (top = maxTop);
		left > maxLeft && (left = maxLeft);
		top < MARGIN && (top = MARGIN);
		left < MARGIN && (left = MARGIN);

		return [top, left];
	};

	// On mouse move, move the window by relative, not absolute coords, that is: initial coords + traveled distance
	const mouseMove = (e: MouseEvent) => {
		const dsc = ds.current;
		if (ref.current === null || !dsc.active) return;
		const newTop = dsc.top0 + e.clientY - dsc.dragY0;
		const newLeft = dsc.left0 + e.clientX - dsc.dragX0;

		setPos(applyLimits([newTop, newLeft]));
	};

	// On mouse up, end dragging
	const mouseUp = () => (ds.current.active = false);

	// On window resize, ensure the dialog is still within limits
	const onResize = () => {
		if (ds.current.active) return; // don't interfere while dragging
		setPos((pos) => applyLimits(pos));
	};

	useEffect(() => {
		document.addEventListener('mousemove', mouseMove);
		document.addEventListener('mouseup', mouseUp);
		window.addEventListener('resize', onResize);

		return () => {
			document.removeEventListener('mousemove', mouseMove);
			document.removeEventListener('mouseup', mouseUp);
			window.removeEventListener('resize', onResize);
		};
	}, []);

	return handleDragStart;
};
