module.exports = async function generate_content({ profile_data, template, color_scheme }) {
  const { name, profession, bio, services } = profile_data;

  const homepage = `
    Welcome to ${name}'s Website!
    ${bio}
    Services: ${services.join(', ')}
    Theme: ${template} with ${color_scheme} colors
  `;

  return {
    homepage,
    about: `About ${name} - ${profession}`,
    contact: `Reach out to ${name} via the contact form.`,
  };
};
