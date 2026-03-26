import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ThemeForm from '@/components/ThemeForm';
import GenerationProgress from '@/components/GenerationProgress';
import ThemePreview from '@/components/ThemePreview';

describe('ThemeForm', () => {
  it('renders all required fields', () => {
    render(<ThemeForm onSubmit={() => {}} disabled={false} />);
    expect(screen.getByLabelText(/Theme Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Generate Theme/ })).toBeInTheDocument();
  });

  it('disables submit when inputs are empty', () => {
    render(<ThemeForm onSubmit={() => {}} disabled={false} />);
    const submitButton = screen.getByRole('button', { name: /Generate Theme/ });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit when name and description are valid', () => {
    render(<ThemeForm onSubmit={() => {}} disabled={false} />);
    fireEvent.change(screen.getByLabelText(/Theme Name/), {
      target: { value: 'My Theme' },
    });
    fireEvent.change(screen.getByLabelText(/Description/), {
      target: { value: 'A beautiful dark theme for photographers with gallery' },
    });
    const submitButton = screen.getByRole('button', { name: /Generate Theme/ });
    expect(submitButton).toBeEnabled();
  });

  it('calls onSubmit with correct data when form is submitted', () => {
    const onSubmit = vi.fn();
    render(<ThemeForm onSubmit={onSubmit} disabled={false} />);
    fireEvent.change(screen.getByLabelText(/Theme Name/), {
      target: { value: 'Test Theme' },
    });
    fireEvent.change(screen.getByLabelText(/Description/), {
      target: { value: 'A simple test theme for validation purposes and testing' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Generate Theme/ }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        themeName: 'Test Theme',
        description: 'A simple test theme for validation purposes and testing',
      })
    );
  });

  it('disables all inputs when disabled prop is true', () => {
    render(<ThemeForm onSubmit={() => {}} disabled={true} />);
    expect(screen.getByLabelText(/Theme Name/)).toBeDisabled();
    expect(screen.getByLabelText(/Description/)).toBeDisabled();
  });

  it('renders quick start presets', () => {
    render(<ThemeForm onSubmit={() => {}} disabled={false} />);
    expect(screen.getByText('Dark Photography Portfolio')).toBeInTheDocument();
    expect(screen.getByText('Clean Business Landing')).toBeInTheDocument();
    expect(screen.getByText('Colorful Food Blog')).toBeInTheDocument();
    expect(screen.getByText('Minimal Tech Docs')).toBeInTheDocument();
  });

  it('fills form when preset is clicked', () => {
    render(<ThemeForm onSubmit={() => {}} disabled={false} />);
    fireEvent.click(screen.getByText('Dark Photography Portfolio'));
    expect(screen.getByLabelText(/Theme Name/)).toHaveValue('Obsidian Lens');
  });

  it('shows advanced options when toggle is clicked', () => {
    render(<ThemeForm onSubmit={() => {}} disabled={false} />);
    fireEvent.click(screen.getByText(/Show Advanced Options/));
    expect(screen.getByText('Typography')).toBeInTheDocument();
    expect(screen.getByText('Site Type / Features')).toBeInTheDocument();
  });
});

describe('GenerationProgress', () => {
  it('renders progress indicator', () => {
    render(<GenerationProgress />);
    expect(screen.getByText(/Analyzing your description/)).toBeInTheDocument();
    expect(screen.getByText(/Elapsed:/)).toBeInTheDocument();
  });

  it('displays generation time guidance', () => {
    render(<GenerationProgress />);
    expect(screen.getByText(/15-45 seconds/)).toBeInTheDocument();
  });
});

describe('ThemePreview', () => {
  const mockBlob = new Blob(['test'], { type: 'application/zip' });

  it('renders success banner', () => {
    render(
      <ThemePreview
        themeName="Test Theme"
        description="A test theme"
        slug="test-theme"
        zipBlob={mockBlob}
        onReset={() => {}}
      />
    );
    expect(screen.getByText(/Theme generated successfully/)).toBeInTheDocument();
  });

  it('renders theme name and description', () => {
    render(
      <ThemePreview
        themeName="My Portfolio"
        description="A photography portfolio"
        slug="my-portfolio"
        zipBlob={mockBlob}
        onReset={() => {}}
      />
    );
    expect(screen.getByText('My Portfolio')).toBeInTheDocument();
    expect(screen.getByText('A photography portfolio')).toBeInTheDocument();
  });

  it('renders download button', () => {
    render(
      <ThemePreview
        themeName="Test"
        description="Test desc"
        slug="test"
        zipBlob={mockBlob}
        onReset={() => {}}
      />
    );
    expect(screen.getByText(/Download Theme/)).toBeInTheDocument();
  });

  it('renders file tree with expected files', () => {
    render(
      <ThemePreview
        themeName="Test"
        description="Test desc"
        slug="test-theme"
        zipBlob={mockBlob}
        onReset={() => {}}
      />
    );
    expect(screen.getByText('test-theme')).toBeInTheDocument();
    expect(screen.getByText('theme.json')).toBeInTheDocument();
    expect(screen.getByText('style.css')).toBeInTheDocument();
    expect(screen.getByText('functions.php')).toBeInTheDocument();
  });

  it('calls onReset when Generate Another is clicked', () => {
    const onReset = vi.fn();
    render(
      <ThemePreview
        themeName="Test"
        description="Test desc"
        slug="test"
        zipBlob={mockBlob}
        onReset={onReset}
      />
    );
    fireEvent.click(screen.getByText('Generate Another'));
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
