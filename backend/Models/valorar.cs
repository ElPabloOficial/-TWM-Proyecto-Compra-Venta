using System;
using System.Collections.Generic;

namespace TiendaOnline.API.Models;

public partial class valorar
{
    public int id_servicio { get; set; }

    public string id_usuario { get; set; } = null!;

    public int precio { get; set; }

    public virtual servicio id_servicioNavigation { get; set; } = null!;

    public virtual usuario id_usuarioNavigation { get; set; } = null!;

    public virtual ICollection<solicitar2> solicitar2s { get; set; } = new List<solicitar2>();
}
